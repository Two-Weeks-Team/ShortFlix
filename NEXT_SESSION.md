# NEXT_SESSION — Handoff for actual development

> **Status as of 2026-05-07**: Pre-development scaffold frozen at Gate H2 (commit `aec3003cd5b5`).
> 30-day Gantt begins from D+1 = 2026-05-08.
> Submission deadline: 2026-06-05 PT (D+29).

## What's done

| | Where | Notes |
|---|---|---|
| 26 advocate previews + meta-tally | `runs/r-20260506T121945Z/` | Gallery on Pages |
| Composite lock | `runs/r-20260506T121945Z/chosen_preview.json` | mobile-first + game-designer + anti-ai |
| 10 mitigation riders | `runs/r-20260506T121945Z/mitigations.json` | Bind to spec/build |
| OpenAPI 3.1 spec | `specs/openapi.yaml` | SHA-256 locked |
| Prisma schema | `prisma/schema.prisma` | 14 models |
| NestJS gateway | `apps/api/` | 13/13 endpoints, no class-validator |
| Next.js PWA | `apps/web/` | mobile-first /app + game-designer / + anti-ai voice |
| Cloud Run deploy config | `deploy/` + `.github/workflows/` | 8 services, CI guards |
| Demo script | `docs/DEMO_SCRIPT.md` | 1:45 storyboard |
| Composite plan | `runs/r-20260506T121945Z/composite-plan.md` | 30-day Gantt + cut-list |

## What's NOT done (the real work)

### Critical (blocks Track 1 submission)
1. **ADK Python agent code** — skeletons exist in `agents/{orchestrator,curator,search,trend-safety}/main.py`. Each needs:
   - `google.adk.agents.Agent` instantiation
   - System prompt that follows the role from `specs/SPEC.md` §6
   - HTTP `POST /a2a/dispatch` endpoint matching `openapi.yaml`
   - Per-agent test harness in `agents/<name>/test_*.py`
2. **3 MCP server tools** — Node skeletons in `agents/mcp-{yt,ig,tt}/src/main.ts`. Each needs:
   - MCP server using `@modelcontextprotocol/sdk`
   - Tool definitions per `specs/SPEC.md` §6 (search, get_trending, get_video_details)
   - RapidAPI client wrapping the chosen provider per platform
3. **Bench harness** — `bench/single_agent_runner.py` + `bench/multi_agent_runner.py` + `bench/ablation.py`. The README's skeptic FAQ refers to specific numbers (0.82 vs 0.41) that come from this harness.
4. **GCP project setup** — see `deploy/README.md` for 8 manual steps (project creation, APIs, Artifact Registry, Firestore, service accounts, Secret Manager, VPC connector, Workload Identity Federation).

### Important (improves win likelihood)
5. **Local build env fix** — macOS Node@24 has `simdjson` dyld mismatch. Either downgrade to Node 20 LTS or `brew uninstall simdjson@4 && brew install simdjson@29`. Cloud Run base images are unaffected.
6. **Real PWA icons** — `apps/web/public/icons/icon-{192,512,maskable-512}.png` are stubs. Replace with real ShortFlix glyph by D+10.
7. **`packages/sdk` generation** — `apps/web/lib/api.ts` mirrors OpenAPI shapes verbatim. Once Node is fixed, run `pnpm --filter api build:swagger && pnpm --filter sdk generate` to switch to typed SDK import.
8. **OAuth client wiring** — `/api/auth/google` exists in NestJS but the frontend has no login button yet (deferred to D+12 per plan).

### Lazy-bound (decide before D+24/D+25)
9. **Brand name** — using "ShortFlix" as working name. All copy in `apps/web/lib/copy.ts` so swap is one-file.
10. **Final domain** — using `*.run.app` during dev. `NEXT_PUBLIC_APP_URL` env var.

## How to resume

```bash
cd /Users/kimsejun/Documents/GitHub/ShortFlix
git status   # should be clean
cat runs/r-20260506T121945Z/composite-plan.md   # full 30-day plan
cat runs/r-20260506T121945Z/run-frozen.json     # freeze hashes
```

The 30-day Gantt in `composite-plan.md` §10 is the canonical work order. Next session priorities:

**Day 1 (today)**: Create GCP project `shortflix`, enable APIs, request $500 credit, deploy `shortflix-api` and `shortflix-web` to Cloud Run on `*.run.app`.

**Day 2**: First ADK Python agent (`orchestrator`) — minimal `Agent` instantiation with `/a2a/dispatch` returning a 200. Push to Artifact Registry, deploy to Cloud Run, update NestJS A2A client URL to point at the deployed service. End-to-end "PWA → API → Orchestrator → 200 OK" smoke test passes.

**Day 3-4**: Curator agent + 3 MCP tools. End-of-Day-4 deliverable: real RapidAPI calls return 9 picks JSON.

**Day 5-7**: Trend-safety agent (Vertex AI Search grounding) + Unified-search agent + Cloud Scheduler nightly batch.

After Week 1: Frontend integration (Week 2), bench/ablation (Week 3), demo + submit (Week 4).

## Honest expectation

Per the composite plan §11: composite confidence ~0.83. Realistic prize EV ~50-55% for any Challenge prize. Higher if execution is clean and demo is recorded with real device for first 28 seconds (3-tap install is the strongest single Demo 20% asset).

## Links

- Repo: https://github.com/Two-Weeks-Team/ShortFlix
- Pages gallery: https://two-weeks-team.github.io/ShortFlix/
- Submission: https://devpost.team/google-cloud-for-startups/hackathons/3197 (login required)

## Memory

User's saved feedback in this project's memory:
- All user-facing questions MUST go through AskUserQuestion tool, not inline prose.
