# Changelog

All notable changes to **ShortFlix** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- D-1 → D+30 development cycle (per `runs/r-20260506T121945Z/composite-plan.md`)
- ADK Python agent code (added separately by user — outside plugin scope)
- Final domain selection (lazy-bind, D+24)
- Final brand name selection (lazy-bind, D+25)
- macOS local build fix for `simdjson` dyld issue (Cloud Run images unaffected)

---

## [0.0.1] — 2026-05-07 — Pre-development scaffold

First locked artifact set produced by the **Preview Forge** pre-development pipeline. No
runtime code is shipped to production at this version; this entry captures the spec,
scaffold, and decision lock that gate D-1.

### Added
- Preview Forge run `r-20260506T121945Z` (standard profile, expanded to max-equivalent — **26 advocates** across ideation/TP/BP/UP/RP standups)
- 4-Panel meta-tally verdict with **10 mitigation riders** carried into the composite plan
- Composite preview lock: **#9 mobile-first + #20 game-designer + #15 anti-ai** (synthesis)
- SpecDD lock:
  - `specs/openapi.yaml` — **16 paths**
  - `prisma/schema.prisma` — **14 models**
  - `specs/SPEC.md` — narrative spec, locked
- Backend scaffold: **58 NestJS files**, **13/13 endpoints** typed via `@nestia`
- Frontend scaffold: **47 Next.js files**, all routes **≤ 126 KB** First Load JS
- DevOps scaffold: **38 files** — **8 Cloud Run services**, Cloud Scheduler wiring, IAM least-privilege
- Live preview gallery (`index.html`) with iframe previews, filter/search/vote
- Standup artifacts: `ideation-001`, `tp-001`, `bp-001`, `up-001`, `rp-001`, `be-001`

### Locked
- SHA-256 hashes (see `specs/openapi.lock.txt`):
  - `openapi.yaml` → `034ba875…4339`
  - `prisma/schema.prisma` → `25788902…df4a14`
  - `SPEC.md` → `7c425a4f…c623011`
- Spec evaluator-optimizer loop terminated by **consensus** at Iter 2 (0 blocking), not by iteration cap
  - Iter 1: 4 blocking (SC1 oauth2 scheme; SC1 bearer/cookie missing 403; SC5 logout 409; SC7 verb-in-path)
  - Iter 2: 0 blocking (SC2/SC3/SC4/SC6 advisories addressed inline)

### Decided (Gate H1)
- **Composite**: mobile-first + game-designer + anti-ai
- **GCP project**: `shortflix` (new)
- **Domain & brand name**: lazy-bind to D+24 / D+25
- **Game scope**: full **Streak + 4-Quest**
- **Stripe receipt**: test mode

### Deferred
- ADK Python agent code (out of plugin scope; user adds separately)
- Final domain
- Final brand name
- macOS local build (`simdjson` dyld) — Cloud Run images unaffected

### Notes
- Validation: Python `yaml.safe_load` + structural ref/brace checks (spectral CLI blocked by node24 dyld on local macOS)
- Reporting line: M3 Dev PM
- Commits in this entry: `2c73613` (bootstrap) · `43b26d4` (gallery) · `d289d32` (composite plan) · `4f3abd5` (Gate H1 lock) · `c9cf8e5` (SpecDD + scaffold, 160 files)

---

[Unreleased]: https://example.invalid/shortflix/compare/v0.0.1...HEAD
[0.0.1]: https://example.invalid/shortflix/releases/tag/v0.0.1
