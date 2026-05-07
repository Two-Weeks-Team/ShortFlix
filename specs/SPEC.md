# ShortFlix — Specification (SPEC.md)

> **Run**: `r-20260506T121945Z`
> **Composite**: the-mobile-first (PWA `/app`) + the-game-designer (landing `/`) + the-anti-ai (voice)
> **Stack lock**: Google ADK + Gemini API + MCP + Cloud Run (4 agent services + 3 MCP services)
> **Submission target**: Google for Startups AI Agents Challenge · Track 1 · 2026-06-05 PT
> **Authoritative artifacts**: `specs/openapi.yaml` (v0.1.1) · `prisma/schema.prisma`
> **Lock hash**: see `specs/openapi.lock.txt`

This document is the narrative companion to the OpenAPI spec and the Prisma schema. Where this
document and the OpenAPI/Prisma artifacts disagree, the artifacts win — every divergence is a
bug to file.

---

## 1. Surfaces (locked)

| Path             | Audience              | Composition                                          |
| ---------------- | --------------------- | ---------------------------------------------------- |
| `/`              | Anonymous + new users | game-designer (full streak + 4 quests, anti-ai voice) |
| `/app`           | Installed PWA shell   | mobile-first (4-tab nav)                             |
| `/app/today`     | Today's 9-card issue  | mobile-first × anti-ai detail modal                   |
| `/app/search`    | NL search             | mobile-first; 9:16 result cards                       |
| `/app/saved`     | Saved picks           | mobile-first                                         |
| `/app/quest`     | Quest tab (logged-in) | mirrors `/` for retention                            |

The PWA installs in three taps via `beforeinstallprompt` on `/` and `/app/today`. Service
worker pre-caches yesterday's issue for offline-first behavior.

---

## 2. Architecture (locked, see `composite-plan.md` §4)

Seven Cloud Run services on the `shortflix` GCP project (new — H1 user decision):

```
Agent services (4):
  ├─ orchestrator       (ADK)              — front-door + nightly batch trigger
  ├─ curator            (Gemini 1.5 Flash) — ranks candidates, writes Issue
  ├─ unified-search     (Gemini)           — NL query → 3-platform plan
  └─ trend-safety       (Gemini + Vertex AI Search grounding)

MCP tool services (3):
  ├─ yt-shorts-mcp   ──┐
  ├─ ig-reels-mcp   ──┼── RapidAPI (egress allowlist enforced — MD-03)
  └─ tiktok-mcp     ──┘
```

Service-to-service auth: Cloud Run IAM `roles/run.invoker` + Google-signed identity tokens.
Trace separation: every A2A and MCP call carries a W3C `traceparent` header so the seven
services appear as distinct OpenTelemetry spans (MD-02 — judges can read this in
`gcloud trace describe`).

---

## 3. REST API surface (PWA → orchestrator)

All REST endpoints are served by the **orchestrator** Cloud Run service. Spec is in
`specs/openapi.yaml`. Endpoint table:

| Method | Path                                       | Tag       | Scope         | Notes                                                |
| ------ | ------------------------------------------ | --------- | ------------- | ---------------------------------------------------- |
| POST   | `/api/auth/google`                         | auth      | (public)      | OAuth 2.1 PKCE code exchange.                        |
| POST   | `/api/auth/logout`                         | auth      | (session)     | Clear cookie, revoke JWT. Idempotent.                |
| GET    | `/api/today`                               | today     | `read:today`  | ETag + 304. Locale via `Accept-Language`.            |
| GET    | `/api/today/{date}`                        | today     | `read:today`  | Cursor-paginated.                                    |
| POST   | `/api/search`                              | search    | `read:search` | NL query → unified-search agent. Idempotent.         |
| GET    | `/api/quests`                              | quest     | `read:today`  | List today's quest progress.                         |
| GET    | `/api/quests/{questId}`                    | quest     | `read:today`  | Single quest progress.                               |
| POST   | `/api/quests/{questId}/completions`        | quest     | `write:quest` | Mark quest complete (REST-canonical sub-resource).   |
| GET    | `/api/streak`                              | quest     | `read:today`  | Streak counter.                                      |
| GET    | `/api/ablation`                            | ablation  | `read:today`  | Drop-one-agent table. Powers the modal toggle.       |
| POST   | `/api/events/picks`                        | events    | `write:event` | Batched view/save/share/dismiss/why-opened events.   |
| GET    | `/api/health`                              | ops       | (public)      | Orchestrator liveness.                               |
| GET    | `/api/health/{service}`                    | ops       | (public)      | One of the 7 services.                               |

> **REST design note**: the quest "complete" action is modeled as a POST to a
> `/completions` sub-collection (created in Iteration 2 per spec-critic-api-design — verbs in
> path are avoided). Pick events are batched (`/events/picks`) to avoid N+1 client-server
> chatter when a user views multiple cards in quick succession.

**Security headers** on every response (orchestrator middleware):

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Content-Security-Policy: default-src 'self'; img-src 'self' https: data:; media-src 'self' https:; connect-src 'self' https://api.shortflix.run.app; frame-ancestors 'none'`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Content-Type-Options: nosniff`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`

**Rate limits** (orchestrator middleware, Redis-backed token bucket):

- `60 req/min` per user for read endpoints
- `10 req/min` per user for `/api/search`
- Limit headers per IETF draft: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`.

**Auth schemes registered** (OpenAPI `securitySchemes`):

- `sessionCookie` — HttpOnly + Secure + SameSite=Lax cookie, set by `/api/auth/google`.
- `bearerAuth` — `Authorization: Bearer <jwt>` for non-cookie clients.
- `oauth2` (authorizationCode + PKCE) — declares Google as `authorizationUrl` and the
  ShortFlix `/api/auth/google` as `tokenUrl`. Scopes enumerated.
- `serviceAccount` — Google-signed identity token for A2A and MCP.

---

## 4. A2A (agent-to-agent) contracts

Each agent Cloud Run service exposes:

- `POST /a2a/dispatch` — receives a dispatch from the orchestrator.
- `POST /a2a/respond` — orchestrator-only callback endpoint for long-running tasks.
- `GET /api/health` — liveness.

The dispatch envelope is `A2ADispatchRequest` in the OpenAPI spec.

### RPC catalog

| RPC                      | From         | To              | Payload                                              |
| ------------------------ | ------------ | --------------- | ---------------------------------------------------- |
| `curator.rank`           | orchestrator | curator         | `{ candidates: Pick[], userId, locale, watchHashes }` |
| `curator.nightly_run`    | orchestrator | curator         | `{ issueDate, locale }` — triggered by Cloud Scheduler |
| `unified_search.plan`    | orchestrator | unified-search  | `{ rawQuery, acceptLang, languages? }`               |
| `unified_search.execute` | orchestrator | unified-search  | `{ planId }` — runs the 3-platform fanout            |
| `trend_safety.classify`  | orchestrator | trend-safety    | `{ candidates: Pick[] }` → adds `trendSafetyTags`     |
| `trend_safety.ground`    | orchestrator | trend-safety    | `{ topic }` → Vertex AI Search-grounded summary       |

All A2A calls are idempotent on `(traceId, rpc)`. Retries by the orchestrator do not
duplicate work; the agent service short-circuits to its prior response when the trace+rpc
tuple repeats.

---

## 5. MCP tool contracts

The three MCP services (`yt-shorts-mcp`, `ig-reels-mcp`, `tiktok-mcp`) speak JSON-RPC 2.0
over HTTP on the path `POST /mcp/{tool}/rpc`. Methods:

| Method            | Params                                          | Returns                            |
| ----------------- | ----------------------------------------------- | ---------------------------------- |
| `list_candidates` | `{ region?, language?, limit?: 1..15, since? }` | `{ candidates: McpCandidate[] }`   |
| `get_video_meta`  | `{ externalId }`                                | `{ candidate: McpCandidate }`      |
| `health`          | `{}`                                            | `{ service, status, providerOk }`  |

`McpCandidate` shape:

```jsonc
{
  "platform": "YOUTUBE_SHORTS" | "INSTAGRAM_REELS" | "TIKTOK",
  "externalId":   "abc123",
  "videoUrl":     "https://...",
  "thumbnailUrl": "https://...",
  "title":        "string|null",
  "altText":      "string",       // best-effort from provider; required field
  "captionLang":  "BCP-47|null",
  "sourceLang":   "BCP-47",
  "region":       "ISO3166-1-alpha-2|null",
  "durationSec":  42,
  "createdAt":    "RFC 3339"
}
```

**Egress allowlist (MD-03)**: each MCP container starts with `--vpc-egress=all-traffic` and a
Cloud NAT egress rule that only allows `*.rapidapi.com` and `*.googleapis.com`. CI grep guard
fails the build if any source string matches
`aistudio\.google\.com|api\.openai\.com|api\.anthropic\.com|graph\.instagram\.com|.*\.tiktok-domain\.com`.

**Per-platform RapidAPI provider** is documented in `LICENSES.md` (per the §8 pre-flight
checklist in `composite-plan.md`). Each provider is pinned by RapidAPI listing slug + version.

---

## 6. Data model (Prisma)

See `prisma/schema.prisma`. Highlights:

- **PII minimization (MD-06)**: `User` stores only `googleSubId`, `displayName`, `locale`,
  `preferredLangs`. No email, no profile picture URL beyond ephemeral signed refs. The
  Google ID token is verified server-side and discarded after JWT minting.
- **Watch history privacy**: `WatchHash` is a SHA-256 prefix of `(userId + videoExternalId)`,
  truncated to 16 hex chars. Last 200 per user, older pruned.
- **Issue + Pick**: per-day, per-locale Issue with exactly 9 Picks. ETag = SHA-256 of
  `(issueDate || sortedPickIds || revision)`. Drives the `/api/today` ETag/304 path.
- **Idempotency**: `IdempotencyRecord` keyed on `Idempotency-Key` + `userId`. TTL 24h.
  Replay returns the stored response; mismatched payload → 409.
- **A11y**: `Pick.altText` is required (NOT NULL) — enforced at the Prisma layer and at the
  curator output validator.
- **A2A audit**: `A2ACall` rows are written by the orchestrator middleware on each dispatch
  and closed on response/timeout. Used to verify trace separation at judging.
- **Consent**: `Consent` rows persist per-scope grants with the privacy-policy hash the user
  saw (GDPR Art. 7 evidence). Required scopes: `analytics`, `personalization`,
  `automated_decision_override`. The last enables the GDPR Art. 22 human-override toggle
  flagged in mitigations watchlist for the-game-designer.

---

## 7. Data flows

### 7.1 Nightly batch (curator)

```
Cloud Scheduler (06:00 user-locale offset, 1 cron per supported locale)
  ↓
orchestrator: receives cron → A2A dispatch curator.nightly_run
  ↓
curator:
  for platform in [YT, IG, TT]:
      MCP.list_candidates(limit=15, region=user-locale-region)  // 9..15 each → ~36..45 candidates
  rank by novelty (Gemini Flash) using user's WatchHash set
  emit 9 picks with rationale + altText + blurb
  ↓
orchestrator: A2A dispatch trend_safety.classify on the 9 picks
  ↓
trend-safety: returns trendSafetyTags
  ↓
orchestrator: writes Issue + Pick rows (Cloud SQL) + Firestore mirror for read fanout
  ↓
orchestrator: triggers bench harness (`bench/ablation.py`) to populate AblationResult rows
```

### 7.2 First-time install / login

```
User taps "Begin issue 001" on /
  ↓
client: PKCE — generates code_verifier + S256 code_challenge → redirects to Google OAuth
  ↓
Google: redirect back to /auth/callback?code=...
  ↓
client: POST /api/auth/google { code, codeVerifier, redirectUri }
  ↓
orchestrator: exchanges code with Google → verifies ID token →
              upserts User → mints session JWT → sets HttpOnly cookie
  ↓
client: navigates to /app/today
  ↓
client: GET /api/today  (sends If-None-Match if SW has cached)
  ↓
orchestrator: returns Issue (200) or 304
```

### 7.3 NL search

```
User types "Sichuan street food after midnight"
  ↓
client: POST /api/search { query, languages: ["zh","en"] }
  ↓
orchestrator: A2A dispatch unified_search.plan
  ↓
unified-search: Gemini → returns { youtube: "Sichuan street food night", instagram: "...", tiktok: "..." }
  ↓
orchestrator: parallel MCP.list_candidates on the 3 plans
  ↓
unified-search.execute: ranks merged set, returns top 30
  ↓
orchestrator: returns SearchResponse (with queryPlan + agentTraceId)
```

### 7.4 Drop-one-agent ablation (in-app reveal)

```
User taps "What did the agents do?" on a Pick
  ↓
client: GET /api/ablation?issueDate=2026-05-07
  ↓
orchestrator: returns AblationResponse (4 rows + baseline) — pre-computed by bench harness
  ↓
client: renders the table; emits POST /api/events/picks { events: [{ eventType: WHY_OPENED ... }] }
        (also feeds RECEIPT_READER quest)
```

---

## 8. Error model (RFC 7807)

Every error response uses `Content-Type: application/problem+json` and the `Problem` schema.

| HTTP | `type` URI suffix                       | When                                                |
| ---- | --------------------------------------- | --------------------------------------------------- |
| 400  | `/problems/bad-request`                 | Malformed body, missing required field.             |
| 401  | `/problems/unauthorized`                | Missing/invalid session or bearer.                  |
| 403  | `/problems/forbidden`                   | Valid session, missing scope.                       |
| 404  | `/problems/not-found`                   | Resource doesn't exist (or was deleted).            |
| 409  | `/problems/idempotency-conflict`        | Same Idempotency-Key, different payload.            |
| 409  | `/problems/quest-already-completed`     | Quest already completed for today.                  |
| 422  | `/problems/quest-progress-insufficient` | progress < target.                                  |
| 422  | `/problems/validation`                  | Field-level validation; see `errors[]`.             |
| 429  | `/problems/rate-limited`                | Token bucket exhausted.                             |
| 503  | `/problems/service-unavailable`         | Upstream agent or MCP service down.                 |

`title` and `detail` are localized per `Accept-Language` (en/ko initially); the actual
rendered locale is reflected in `Problem.lang`. `traceId` is always populated for 5xx (and
on 4xx when one is available).

DTO validation is performed via `typia` runtime validators (NOT `class-validator` per
project rule). Validation failures emit 422 with field-level `errors[]`.

---

## 9. i18n / l10n

- **UI chrome**: en (default), ko. Resource bundles in `i18n/{en,ko}.json`. New locale
  contributions are additive — no enum bumps required server-side.
- **Negotiation**: `Accept-Language` parsed per RFC 7231 §5.3.5; q-values respected. Falls
  back to en. The actual locale chosen is echoed in `Problem.lang` and in a
  `Content-Language` response header.
- **Video card text**: `blurb` is in the source language of the content (anti-ai voice
  decision); `altText` mirrors that with an English fallback when none supplied. Frontend
  may request a translation via a future `/api/translate` endpoint — out of scope for v0.1.
- **Currency** (Stripe receipt scene MD-04): integer minor units only. No floats.
  `usdCents`, `krwUnits`, etc.
- **Dates**: ISO 8601 / RFC 3339 strings on the wire. Frontend renders in user-locale tz.
- **Number/date formatting**: client-side `Intl.NumberFormat` + `Intl.DateTimeFormat`.

---

## 10. Idempotency

Required on every state-mutating POST. Header: `Idempotency-Key: <UUIDv4>`.

Server flow:

1. Compute `requestHash = SHA-256(canonicalize(body) + path)`.
2. Lookup `IdempotencyRecord` by `key` AND `userId`.
3. Hit + same `requestHash` → replay stored response (status + body).
4. Hit + different `requestHash` → 409 `idempotency-conflict`.
5. Miss → process; write record (key, userId, requestHash, response code+body,
   `expiresAt = now + 24h`) atomically with the side-effect.
6. A nightly cleanup job purges expired records.

Endpoints with mandatory Idempotency-Key in production:

- `POST /api/auth/google`
- `POST /api/search`
- `POST /api/quests/{questId}/completions`
- `POST /api/events/picks`
- `POST /a2a/dispatch` and `/a2a/respond` (service-to-service idempotency on `traceId`)

`POST /api/auth/logout` accepts the header but treats absent/empty body as canonical so
repeated calls are no-ops (returns 204 either way; only a different non-empty body produces
409).

---

## 11. Security (per spec-critic-security + MD-03/MD-06)

- **OAuth 2.1 PKCE** for Google sign-in. Authorization Code + PKCE (S256). No implicit/
  password flows.
- **Session JWT**: RS256 with KMS-managed key (Cloud KMS), rotated weekly. JWT contains
  `sub`, `scopes`, `iat`, `exp`, `jti`. Lifetime: 30 days; refresh on activity.
- **Cookie**: `HttpOnly; Secure; SameSite=Lax; Path=/`. Cross-site fetch from `/` to `/api`
  is same-origin, so SameSite=Lax suffices.
- **CSRF**: same-origin + SameSite=Lax + custom header `X-Requested-With: XMLHttpRequest`
  required on POST. Reject if missing.
- **Scope split**: `read:today`, `read:search`, `write:quest`, `write:event`, `admin:bench`.
  Read endpoints never accept write scopes; write endpoints check scope explicitly.
  Insufficient scope → 403 (not 401).
- **Service-to-service**: Google-signed identity tokens; `roles/run.invoker` IAM only.
- **Egress allowlist (MD-03)**: enforced at Cloud NAT layer. CI grep guard for unofficial
  APIs.
- **Secret management**: GCP Secret Manager + Workload Identity Federation. No `.env` in repo.
- **Privacy (MD-06)**: PII surface = Google sub-id + display name + last-N watch hashes only.
  Privacy policy + DPIA stub at `docs/privacy/{policy,dpia}.md` by D+10. Consent records
  logged.
- **GDPR Art. 22 override**: `automated_decision_override` consent unlocks a UI control to
  manually swap a Pick (the-game-designer watchlist mitigation).
- **DSR**: `DELETE /api/account` (admin-confirmed v0.1) wipes User + Cascade.

---

## 12. Performance budgets

- p50 server response (orchestrator): **250 ms** for read endpoints; **1.5 s** for
  `/api/search` (3-platform fanout).
- p95 server response: 750 ms read; 4 s search.
- LCP (`/app/today`): **< 1.5 s** on 3G Fast (Lighthouse mobile).
- TTI: **< 2.5 s** on 3G Fast.
- Lighthouse PWA score: **≥ 90** for "Installable" + "Offline" categories (CI gate from D+10).
- Service-worker cache budget: 5 MB max per device.
- Cursor pagination on `/api/today/{date}` to bound payload size; no UNBOUNDED list endpoints.
- ETag on `/api/today` and `/api/ablation` to support 304 replies.
- Pick-event batching (`/api/events/picks` accepts ≤ 50 events per call) prevents
  client-side N+1.
- N+1 prevention server-side: Issue → Pick eager-loaded via Prisma `include`; SearchResult
  batched.

---

## 13. Accessibility

- `altText` is REQUIRED on every Pick and SearchResult — the Prisma schema enforces NOT NULL,
  and the curator agent's output validator rejects empty strings.
- `captionLang` populated when captions exist; UI renders captions when present.
- Color contrast: WCAG AA on all PWA views (verified via Lighthouse).
- Keyboard nav: every interactive element reachable via Tab; focus rings visible.
- Screen-reader: 9-card grid uses `role="list"`/`role="listitem"`; "Why this issue?" is
  `<button aria-expanded>`; ablation table is a real `<table>` with `<th scope="row">` per
  dropped agent name.
- The OpenAPI `description` field is populated on every operation, parameter, schema, and
  enumerated property (lint enforced via Spectral `oas3-1` + `oas3-api-servers` +
  `description` rules).
- i18n labels via `aria-label` for icon-only controls.

---

## 14. Observability

- **OpenTelemetry**: every Cloud Run service emits spans. `traceparent` propagated via A2A
  and MCP. The 7-service trace tree visible in `gcloud trace describe <traceId>`.
- **Logs**: structured JSON (Cloud Logging). Field whitelist:
  `severity, ts, service, traceId, spanId, msg, fields{userId?, pickId?, route, statusCode, durationMs}`.
- **Metrics**: per-service `request_count`, `request_duration_ms`, `error_count`,
  `mcp_provider_latency_ms`. Dashboards in Cloud Monitoring.
- **Trace badge** in the in-app "About" panel: shows the latest trace ID and a deep link to
  Cloud Trace (admin scope only).

---

## 15. Compliance with mitigation riders

| Rider  | Where enforced                                                              |
| ------ | --------------------------------------------------------------------------- |
| MD-01  | `/api/ablation` + bench harness writes `AblationResult` rows                |
| MD-02  | 7 separate Cloud Run services + `traceparent` on every A2A/MCP call         |
| MD-03  | Cloud NAT egress allowlist + CI grep guard                                  |
| MD-04  | Stripe test-mode receipt; data model treats currency as integer minor units |
| MD-05  | Out of API scope (demo storyboard) — but `/api/today` payload supports it   |
| MD-06  | Prisma User schema (no email/picture); Consent table; DPIA stub             |
| MD-07  | Out of API scope (timeline)                                                 |
| MD-08  | Out of API scope (demo recording)                                           |
| MD-09  | Out of API scope (Devpost text)                                             |
| MD-10  | `/api/ablation` + agentTraceId on Pick + `/api/health/{service}` for the 7  |

---

## 16. Out of scope (explicit non-goals for v0.1)

- Translation endpoint (`/api/translate`).
- Native iOS/Android apps.
- Push notifications (PWA web-push deferred to post-D+18).
- Public API for third-party developers.
- Account deletion self-service UI (admin-mediated only at v0.1).
- Stripe live-mode billing (test-mode only per H1 user decision).

---

## 17. Versioning

- OpenAPI: `info.version` semver; breaking changes bump major. Pre-1.0 minor bumps may break.
- API base path: `/api` (no `/v1` prefix at v0.1; introduce `/api/v2` at first breaking change).
- Prisma migrations: `prisma migrate` + checked-in migration files. No schema drift in CI.

---

## 18. Build-time verification

- `pnpm spectral lint specs/openapi.yaml` — must pass `oas3-1` + `recommended` ruleset.
- `pnpm prisma format` + `pnpm prisma validate` — must pass.
- `pnpm assert:llm-endpoints` — grep guard for unauthorized LLM endpoints (MD-03).
- `pnpm bench` — runs `bench/single_agent_runner.py` + `bench/multi_agent_runner.py` +
  ablation.
- `pnpm test` — typia validators + integration tests against the orchestrator.

---

## 19. Open issues / deferred decisions (for M3 review)

- Final domain (decided D+25, lazy-bound).
- Final brand name (decided D+24).
- Whether to expose `/api/translate` (pending demo time budget).
- Whether `Issue` should be sharded by region as well as locale (not yet — single locale shard).

---

## 20. Spec-DD review log (evaluator-optimizer)

| Iteration | Author action                            | Critic verdict                                                             |
| --------- | ---------------------------------------- | -------------------------------------------------------------------------- |
| 1         | Initial draft of openapi.yaml + prisma + SPEC.md | 4 BLOCKING from SC1/SC5/SC7: missing oauth2 scheme, logout 409 enumeration, verb-in-path on quest complete, missing 403 enumeration. |
| 2         | Added oauth2 PKCE securityScheme; refactored quest URLs to `/api/quests/{id}/completions`; batched `/api/events/picks`; added 403 responses; added `Problem.lang`; added a11y descriptions on AblationResponse. | 0 BLOCKING. SC2/SC3/SC4/SC6 minor advisories (already addressed inline). Locked. |

---

*End of SPEC.md — accompanies `specs/openapi.yaml` and `prisma/schema.prisma`, locked
together via `specs/openapi.lock.txt`.*
