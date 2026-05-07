# BUILD_NOTES.md — apps/api

> **Run**: `r-20260506T121945Z`
> **Author**: BE_LEAD (Tier 2, BE01-BE05 work folded due to single-pass dispatch)
> **Date**: 2026-05-07

## Local build status

`pnpm install` and `pnpm build` could not be executed in the BE_LEAD agent
sandbox because the local `node@24` (and 22/23/25) brew installations all link
against `libsimdjson.29.dylib`, but the system has `simdjson@4.6.3` which only
ships `libsimdjson.33.dylib`. Every `node` invocation fails with:

```
dyld[…]: Library not loaded: /opt/homebrew/opt/simdjson/lib/libsimdjson.29.dylib
Reason: tried: '…/libsimdjson.29.dylib' (no such file)
```

This is the **same blocker** that SPEC_LEAD documented in
`specs/openapi.lock.txt` line 5 ("spectral CLI blocked by node24 dyld"). The
fix is **environmental**, not a code defect — operator runs:

```bash
brew uninstall --ignore-dependencies simdjson
brew install simdjson@29 || ln -s /opt/homebrew/Cellar/simdjson/4.6.3/lib/libsimdjson.33.dylib \
                                   /opt/homebrew/opt/simdjson/lib/libsimdjson.29.dylib
```

…or installs Node via `nvm` / `volta` instead of brew. Once Node works:

```bash
cd apps/api
pnpm install                    # ts-patch postinstall wires typia transformer
pnpm prisma:generate            # generates @prisma/client against ../../prisma/schema.prisma
pnpm build 2>&1 | tee build.log # nest build (TypeScript + typia transformer)
pnpm build:swagger              # apps/api/specs/swagger.json from controllers
```

## Static verification (what we did instead)

Performed via Python AST/grep:

| Check                                            | Result                |
| ------------------------------------------------ | --------------------- |
| Spec lock SHA-256 (openapi.yaml + schema.prisma) | matches openapi.lock.txt |
| `class-validator` imports                        | **0** (banned)        |
| `typia` tag annotations in `src/dtos/`           | 79                    |
| Controllers with `@nestia/core` `TypedRoute`     | 7                     |
| `@nestjs/common` `@Controller` decorators         | 7                     |
| OpenAPI endpoints covered (REST surface)         | **13 / 13**           |
| Modules registered in AppModule                   | 9                     |
| Prisma model usages match schema                 | yes (Issue, Pick, QuestProgress, Streak, AblationResult, AblationView, IdempotencyRecord, PickEvent, SearchQuery, SearchResult, User, WatchHash) |

## Endpoint coverage map

| Method · Path                                  | Controller                          |
| ---------------------------------------------- | ----------------------------------- |
| POST `/api/auth/google`                        | `auth/auth.controller.ts`           |
| POST `/api/auth/logout`                        | `auth/auth.controller.ts`           |
| GET  `/api/today`                              | `today/today.controller.ts`         |
| GET  `/api/today/{date}`                       | `today/today.controller.ts`         |
| POST `/api/search`                             | `search/search.controller.ts`       |
| GET  `/api/quests`                             | `quest/quest.controller.ts`         |
| GET  `/api/quests/{questId}`                   | `quest/quest.controller.ts`         |
| POST `/api/quests/{questId}/completions`        | `quest/quest.controller.ts`         |
| GET  `/api/streak`                             | `quest/quest.controller.ts`         |
| GET  `/api/ablation`                           | `ablation/ablation.controller.ts`   |
| POST `/api/events/picks`                       | `events/events.controller.ts`       |
| GET  `/api/health`                             | `health/health.controller.ts`       |
| GET  `/api/health/{service}`                   | `health/health.controller.ts`       |

## A2A / MCP HTTP stub locations (Python services land later)

| Stub call site                                 | Target Python service              | Default URL              |
| ---------------------------------------------- | ----------------------------------- | ------------------------ |
| `a2a/a2a-client.service.ts` `dispatch()`        | orchestrator (front-door)          | `http://localhost:8081`  |
| `a2a/a2a-client.service.ts` `dispatchTo(CURATOR)` | curator                          | `http://localhost:8082`  |
| `a2a/a2a-client.service.ts` `dispatchTo(UNIFIED_SEARCH)` | unified-search           | `http://localhost:8083`  |
| `a2a/a2a-client.service.ts` `dispatchTo(TREND_SAFETY)` | trend-safety               | `http://localhost:8084`  |
| `health/health.controller.ts` (per-service)    | `{service}` proxied               | `http://localhost:809[1-3]` (MCP) |

All A2A calls forward W3C `traceparent` per MD-02 (trace separation across the
seven services). On 5xx upstream the gateway returns `application/problem+json`
with type `https://shortflix.run.app/problems/service-unavailable` and includes
the `traceId` extracted from the `traceparent`.

## Mitigation rider compliance

| Rider  | Where enforced                                                                |
| ------ | ----------------------------------------------------------------------------- |
| MD-02  | `a2a/a2a-client.service.ts` propagates `traceparent`; agents are separate URLs |
| MD-03  | Gateway never makes outbound HTTP except to configured agent/MCP base URLs;   |
|        | no `rapidapi.com` or LLM-vendor strings present in source (verifiable via grep) |
| MD-06  | `auth/google-oauth.service.ts` discards Google email + picture; only `sub`,   |
|        | `name`, `locale` propagate to User. Prisma `User` model has no email column.   |

## Staleness check (swagger.json ↔ openapi.yaml)

`apps/api/specs/swagger.json` is a placeholder until `pnpm build:swagger` runs.
The CI staleness check should be added under
`.github/workflows/spec-staleness.yml` (out of BE_LEAD scope; tracked as a
follow-up for FE_LEAD/CI lead). Recommended check:

```yaml
# pseudo-code
- run: pnpm --filter @shortflix/api build:swagger
- run: |
    diff <(jq -S '.paths | keys[]' apps/api/specs/swagger.json) \
         <(yq '.paths | keys[]' specs/openapi.yaml) || \
      { echo "swagger drifted from openapi.yaml"; exit 1; }
```

Until Node is fixed locally, treat the staleness count as **0 by-construction**
(every controller's TypedRoute path matches the spec verbatim — verified
manually against the 13-row endpoint table above).

## Deferred work (file as M3 follow-up)

1. Run `pnpm build` once Node is repaired; commit the regenerated
   `apps/api/specs/swagger.json`. Build log → `apps/api/build.log`.
2. Wire CI staleness check (above).
3. Add E2E tests under `apps/api/test/e2e/` once the Python agent stubs land.
4. Replace HS256 JWT secret with KMS-backed RS256 key rotation (SPEC.md §11).
5. Add `@nestjs/throttler` or Redis-backed rate limit when moving to multi-pod
   prod (current in-memory bucket is single-instance only).
