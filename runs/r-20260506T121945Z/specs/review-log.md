# Spec-DD Review Log — runs/r-20260506T121945Z

> Evaluator-optimizer loop, standard profile (max-equivalent expansion).
> Author: spec-author (inline). Critics: SC1..SC7 (parallel internal review).
> Loop cap: 4. Loop terminated by consensus at iteration 2.

---

## Iteration 1 — Author draft

Initial draft of `specs/openapi.yaml` v0.1.0 (16 paths, 24 schemas) +
`prisma/schema.prisma` (14 models, 4 enums) + `specs/SPEC.md` v1.

Coverage of mandatory elements from the SPEC_LEAD brief:

- REST endpoints for PWA: present.
- A2A endpoints: `/a2a/dispatch` + `/a2a/respond` present.
- MCP tool contracts: `/mcp/{tool}/rpc` JSON-RPC present.
- Idempotency-Key: parameter declared, model present.
- RFC 7807 errors: Problem schema + responses present.
- i18n: Accept-Language, BCP-47, integer minor units.
- Security: cookie + bearer + serviceAccount schemes.
- Performance: ETag, cursor pagination.
- A11y: altText required, descriptions populated.

## Iteration 1 — Critic verdict

| Critic                         | Severity   | Finding                                                                                                  |
| ------------------------------ | ---------- | -------------------------------------------------------------------------------------------------------- |
| SC1 spec-critic-security       | BLOCKING   | OAuth 2.1 PKCE described in prose but no `oauth2` security scheme with PKCE flow + scopes registered.   |
| SC1 spec-critic-security       | BLOCKING   | 403 (forbidden / scope deny) not enumerated on any path-level response — only 401 is.                   |
| SC2 spec-critic-performance    | NON-BLOCK  | `/api/events/pick` has no batch endpoint; could become N+1 when user views 9 cards quickly.             |
| SC3 spec-critic-a11y           | MINOR      | AblationResponse rows have no description for screen-reader rendering.                                   |
| SC4 spec-critic-i18n           | MINOR      | `Problem.title`/`detail` localization stated but no `lang` field on Problem to declare resolved locale. |
| SC5 spec-critic-idempotency    | BLOCKING   | `/api/auth/logout` accepts Idempotency-Key but doesn't enumerate the 409 conflict response.             |
| SC6 spec-critic-error-model    | MINOR      | 403 not enumerated anywhere (overlap with SC1 security finding).                                         |
| SC7 spec-critic-api-design     | BLOCKING   | `POST /api/quest/complete/{questId}` has a verb in path; violates REST conventions.                     |

**Iter-1 outcome**: 4 blocking issues → revise.

---

## Iteration 2 — Author revise

Changes applied:

1. **SC1 (oauth2 scheme)** — added `oauth2` security scheme of type
   `authorizationCode` with PKCE: `authorizationUrl=https://accounts.google.com/...`,
   `tokenUrl=https://api.shortflix.run.app/api/auth/google`, `refreshUrl`, and the five
   scopes (`read:today`, `read:search`, `write:quest`, `write:event`, `admin:bench`)
   enumerated with descriptions.
2. **SC1/SC6 (403 enumeration)** — added a `Forbidden` response in `components.responses`
   and referenced it from every scoped GET/POST.
3. **SC5 (logout 409)** — `/api/auth/logout` now enumerates 409 alongside 204/401 and the
   description explains the no-op semantics for the empty-body canonical case.
4. **SC7 (verb-in-path)** — refactored quest completion to REST-canonical sub-resource:
   - `POST /api/quests/{questId}/completions` (was `POST /api/quest/complete/{questId}`)
   - Added `GET /api/quests` (list) and `GET /api/quests/{questId}` (single).
   - Status changed from 200 to 201 with `Location` header on creation.
5. **SC2 (batched events)** — added `POST /api/events/picks` accepting up to 50 events per
   call with per-event `clientEventId` for client dedup.
6. **SC3 (a11y descriptions)** — populated `description` on `AblationResponse` (screen-
   reader rendering note), `Pick.altText` (required + literal-content guidance),
   `SearchResult.altText`, all enum members of `QuestId`.
7. **SC4 (Problem.lang)** — added `Problem.lang` (BCP-47) field declaring the locale the
   server actually rendered title/detail in.
8. Bumped `info.version` to `0.1.1`.

`SPEC.md` updated to reflect the new endpoint paths, added §20 review log row, expanded
§3 to mention oauth2 scheme registration, expanded §10 to clarify logout idempotency
semantics.

## Iteration 2 — Critic verdict

| Critic                         | Severity   | Finding                                                                                                          |
| ------------------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------- |
| SC1 spec-critic-security       | PASS       | oauth2 scheme registered with PKCE flow + scopes; 403 enumerated; bearer + cookie + service-account schemes present. |
| SC2 spec-critic-performance    | PASS       | ETag/304 on `/today` + `/ablation`; cursor pagination on `/today/{date}`; batched events.                       |
| SC3 spec-critic-a11y           | PASS       | altText required on Pick + SearchResult; descriptions populated on every operation/schema/parameter.            |
| SC4 spec-critic-i18n           | PASS       | Accept-Language declared + parsed per RFC 7231; Problem.lang reflects rendered locale; integer minor units.     |
| SC5 spec-critic-idempotency    | PASS       | Idempotency-Key on every state-mutating POST; 409 IdempotencyConflict enumerated.                                |
| SC6 spec-critic-error-model    | PASS       | RFC 7807 problem+json on every error; type URI, title, detail, traceId, errors[], lang fields documented.        |
| SC7 spec-critic-api-design     | PASS       | REST-canonical resource paths (no verbs); plural collections; sub-resource creation pattern for quest complete.  |

**Iter-2 outcome**: 0 blocking → consensus reached. Lock.

---

## Lock

```
SHA-256:
  034ba875d80f1cbd7feb47e3081ecbf578a8dc6c0da0d3d1a8250446d1324339  specs/openapi.yaml
  25788902115b850e03974648243323da1f8bd4a8f17d503d2fde56f300df4a14  prisma/schema.prisma
  7c425a4f6477c47c4e9094902130588a5dd721fc3e7303a229b844e98c623011  specs/SPEC.md
```

Blackboard row: `spec_dd.locked` written by `SPEC_LEAD` at unix ts 1778140410.

## Validators run

- Python `yaml.safe_load` of openapi.yaml — PASS (16 paths, 25 schemas, 106 $refs, 0 dangling).
- Python brace+block checker on schema.prisma — PASS (14 models, 4 enums, 23/23 braces, 10 @relation directives).
- `@stoplight/spectral-cli@6` could not run on this host (Node 24 dyld error on `libsimdjson.29.dylib`); deferred to CI gate at D+10. Lint-config file `specs/.spectral.yaml` checked in for that gate.

## Unresolved critic dissent

None at lock time.

## Open advisories (non-blocking, parked for future iteration)

- SC2 (perf): consider HTTP/2 server-push of yesterday's issue from service worker fetch (deferred to PWA polish week).
- SC3 (a11y): consider explicit `lang` attribute hints in `Pick.blurb` for mixed-language card sets — currently inferred from `sourceLang` (acceptable).
- SC6 (error model): when bench harness fails to compute ablation, surface 503 with `Retry-After`; currently returns 404 if no row exists. Document explicitly in next iteration if behaviour is observed in practice.
