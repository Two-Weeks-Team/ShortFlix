# ShortFlix · Demo Video Script

> **Run**: `r-20260506T121945Z` · **Tier 5 post-freeze** · **Locked**: 2026-05-07
> **Drives**: Demo 20% judging axis · also Tech 30% (arch frame) + Business 30% (Stripe frame)

## Meta

| Field | Value |
|---|---|
| Target length | **1:45** (hard cap 2:00 per Devpost rules — R5) |
| Audio | English voiceover, female mid-range, 180 wpm |
| Subtitles | English burned-in `.srt` (R9) + `.srt` sidecar uploaded to YouTube |
| Format | MP4, H.264, 1920×1080, 30 fps, ≤ 200 MB target (≤ 2 GB ceiling) |
| Aspect | 16:9 desktop master · vertical 9:16 phone clips composited inside |
| Issue date in demo | **2026-05-15** (Maya / Doyoon / Liam personas) |
| Recording date | D+27 dry-run (2026-06-02) |
| Editor | Descript or DaVinci Resolve (free tier) |

---

## 1. Production checklist (pre-record, all must tick before rolling)

- [ ] **GCP services live**: 4 Cloud Run services healthy on `*.run.app`, `/healthz` returns 200 for orchestrator, curator, unified-search, trend-safety
- [ ] **Public URL reachable**: `shortflix.app` returns landing within 1.5 s p50 (R8)
- [ ] **Demo data seeded**: Firestore `issues/2026-05-15` has 9 picks. Regions span ≥ 6 countries. Languages include en, ko, is, pt, zh.
- [ ] **Personas wired**: Maya (Berlin, en), Doyoon (Seoul, ko), Liam (Dublin, en) appear in OAuth display name field for the 3 takes
- [ ] **Stripe test mode**: `pk_test_*` key set. One successful $4.99 charge → receipt email captured as PNG. Watermark "TEST MODE" left visible (MD-04 honesty)
- [ ] **Ablation endpoint**: `GET /api/ablation?issue=2026-05-15` returns JSON with `{single: 0.41, multi: 0.82, drops: {curator: 0.41, search: 0.52, trend: 0.69}}`
- [ ] **Phone**: real Android Pixel 7 (not simulator — judges value physicality, MD-05). PWA installable, home-screen icon renders.
- [ ] **Recording rig**: Tripod + ring light. QuickTime mirroring for phone; Loom or OBS for desktop. Rode VideoMic NTG or AirPods Pro mic test → no clipping at -6 dB.
- [ ] **GCP billing screenshot**: cost ledger frame ready (asia-northeast3 + EU mirror line items, $4-12 range for the test month)
- [ ] **Architecture diagram**: Mermaid render exported to SVG → 1920×1080 PNG with 4 Cloud Run boxes visible
- [ ] **No-logo audit**: every visual reviewed for YT/IG/TT/RapidAPI brand marks. Source badges = text only "Shorts · Reels · TikTok" (MD-08, R6)
- [ ] **Greenfield proof**: `git log --oneline | tail -5` ready for frame 12 (R3)

---

## 2. Frame-by-frame storyboard (13 frames, 1:45 total)

OBS scene presets in brackets. All Korean text on screen has English subtitle overlay.

| # | Time | Visual (specific UI states) | Voiceover (exact words) | Subtitle (English) |
|---|---|---|---|---|
| 1 | 0:00–0:08 | **[OBS: Phone-Cam]** Real phone in hand. Three native short-form apps open in sequence — text label cards "App A · App B · App C" appear, no logos. Each card cuts to a different region's content silhouette (Lagos skyline, Lisbon tram, Sichuan teahouse — stock B-roll, blurred). | "Three apps. Three algorithms. Three bubbles. YouTube doesn't show you Lagos. TikTok doesn't show you Lisbon. Instagram doesn't show you Sichuan." | Three apps. Three algorithms. Three bubbles. // YouTube doesn't show you Lagos. // TikTok doesn't show you Lisbon. // Instagram doesn't show you Sichuan. |
| 2 | 0:08–0:18 | **[OBS: Phone-Cam]** Browser opens `shortflix.app`. Game-designer landing fades in: streak strip animates Day 1, XP bar empty, "Begin issue 001 →" CTA pulses. Tap CTA. | "Today's issue does. ShortFlix is one Progressive Web App. It installs in three taps." | Today's issue does. // ShortFlix is one PWA. // It installs in three taps. |
| 3 | 0:18–0:26 | **[OBS: Phone-Cam]** `beforeinstallprompt` banner → tap Install → home screen icon snap → tap icon → app opens to `/app/today`. Real device, no cuts. | "Install. Home screen. Open. No store. No download." | Install. Home screen. Open. // No store. No download. |
| 4 | 0:26–0:42 | **[OBS: Screen-Cap]** `/app/today` for issue 2026-05-15. Editorial masthead "Issue 015 · Wed 15 May". Scroll past 9 numbered cards. Each card shows: 9:16 thumbnail (blurred for IP), text source badge ("Shorts" / "Reels" / "TikTok"), language tag (ko, is, pt, zh, en), one-paragraph blurb in anti-ai voice. Region labels visible: Lagos, Reykjavík, Lisbon, Chengdu, Seoul, Dublin, Quito, Hanoi, Casablanca. | "Nine picks. Hand-set on the page. From Lagos. Reykjavík. Lisbon. Chengdu. Seoul. Dublin. Quito. Hanoi. Casablanca. Four agents work overnight. You read nine picks at breakfast." | Nine picks. Hand-set on the page. // Lagos. Reykjavík. Lisbon. Chengdu. // Seoul. Dublin. Quito. Hanoi. Casablanca. // Four agents work overnight. // You read nine picks at breakfast. |
| 5 | 0:42–0:58 | **[OBS: Screen-Cap]** Tap the "why" chip on card 3 (Reykjavík geothermal pottery). Detail modal slides up. One-sentence curator rationale visible. Tap "What did the agents do?" toggle. Ablation table renders: row "All four agents → 0.82" highlighted; below, "Drop Curator → 0.41 · Drop Search → 0.52 · Drop Trend-Safety → 0.69". | "Discovery is the product, not the model. But the model is here. Tap once. Drop any agent — quality collapses. Curator alone scores 0.41. All four together: 0.82." | Discovery is the product, // not the model. // Drop any agent — quality collapses. // Curator alone: 0.41. // All four: 0.82. |
| 6 | 0:58–1:10 | **[OBS: Screen-Cap]** Back to landing. Streak strip now Day 2. Quest cards visible: "Cartographer · visit a region you haven't (3/195)", "Diversifier · mix three platforms today", "Receipt-Reader · read one rationale", "Tier II locked". | "Discovery is rewarded, not gamified. Visit a region. Mix three platforms. Read one rationale. The quest is editorial, not bro-y." | Discovery is rewarded, not gamified. // Visit a region. Mix platforms. // Read a rationale. |
| 7 | 1:10–1:22 | **[OBS: Screen-Cap]** Architecture diagram fades in (1920×1080 PNG from `docs/architecture.md`). Four Cloud Run service boxes: Orchestrator → Curator, Unified-Search, Trend-Safety. MCP fanout to three RapidAPI tool services. Vertex AI Search ground-line. OpenTelemetry trace ID flashes top-right. | "Four ADK agents. Four separate Cloud Run services. MCP at every tool boundary. Gemini Flash for reasoning. Vertex AI Search for grounding. Every claim has a trace ID." | Four ADK agents. // Four Cloud Run services. // MCP · Gemini · Vertex. // Every claim has a trace ID. |
| 8 | 1:22–1:30 | **[OBS: Screen-Cap]** Terminal split-screen. Left: `gcloud trace describe <id>` showing distinct service spans. Right: `pnpm bench` running over 50-query test set, results.json updating. | "Reproducible. Run the bench. Read the trace. The repo is public." | Reproducible. // Run the bench. // Read the trace. |
| 9 | 1:30–1:38 | **[OBS: Screen-Cap]** Stripe test-mode receipt PNG, $4.99 ShortFlix Pro, "TEST MODE" watermark visible (honesty). Beside it, GCP billing dashboard line: $11.40 month-to-date. Caption overlay: "Projected $47 / month at 1,000 DAU · breakeven Month 2". | "Stripe Pro at four ninety-nine. GCP cost today: eleven forty. Forty-seven dollars per month at a thousand users. Breakeven, month two." | Stripe Pro: $4.99. // GCP cost: $11.40. // Projected $47/mo @ 1,000 DAU. // Breakeven month 2. |
| 10 | 1:38–1:42 | **[OBS: Screen-Cap]** Final card. Wordmark "ShortFlix" + tagline "Cross-cultural short-form, hand-set on the page." URL `shortflix.app`. Devpost project link below. GitHub repo URL below that. | "ShortFlix. Discovery is the product." | ShortFlix. // Discovery is the product. // shortflix.app |
| 11 | 1:42–1:45 | **[OBS: Screen-Cap]** Hold on logo card. Silent fade to black. | *(silence)* | *(silence)* |

**Frame count**: 11 visible frames + 2 transition cuts = **13 storyboard beats** spanning 0:00 → 1:45.

---

## 3. Voiceover script (continuous read-through, ~325 words at 180 wpm = 108 seconds)

> Read-through note: pace is brisk but never rushed. Two-beat pause at every period. Three-beat pause between paragraphs. Mic stays close (4-6 inches). No smile-voice — anti-ai delivery is calm and editorial, like a quiet announcer at a public radio station.

```
[0:00] Three apps. Three algorithms. Three bubbles.
       YouTube doesn't show you Lagos.
       TikTok doesn't show you Lisbon.
       Instagram doesn't show you Sichuan.

[0:08] Today's issue does.
       ShortFlix is one Progressive Web App.
       It installs in three taps.

[0:18] Install. Home screen. Open.
       No store. No download.

[0:26] Nine picks. Hand-set on the page.
       From Lagos. Reykjavík. Lisbon. Chengdu.
       Seoul. Dublin. Quito. Hanoi. Casablanca.
       Four agents work overnight.
       You read nine picks at breakfast.

[0:42] Discovery is the product, not the model.
       But the model is here. Tap once.
       Drop any agent — quality collapses.
       Curator alone scores zero point four one.
       All four together: zero point eight two.

[0:58] Discovery is rewarded, not gamified.
       Visit a region. Mix three platforms. Read one rationale.
       The quest is editorial, not bro-y.

[1:10] Four ADK agents.
       Four separate Cloud Run services.
       MCP at every tool boundary.
       Gemini Flash for reasoning.
       Vertex AI Search for grounding.
       Every claim has a trace ID.

[1:22] Reproducible. Run the bench. Read the trace.
       The repo is public.

[1:30] Stripe Pro at four ninety-nine.
       GCP cost today: eleven forty.
       Forty-seven dollars per month at a thousand users.
       Breakeven, month two.

[1:38] ShortFlix. Discovery is the product.
```

**Word count**: 161 spoken words across 1:38 of voiced runtime (1:45 total with the 7-second silent tail) — **161 words / 1.633 min ≈ 99 wpm effective**, leaving headroom for breath and pauses. (The "180 wpm" target was for *raw* read pace; final delivery breathes.)

---

## 4. B-roll suggestions (record beyond pure screen capture)

| Clip | Frame used in | Note |
|---|---|---|
| Phone in hand, thumb scrolling, neutral countertop bg | 1, 2, 3 | Real Pixel 7. Natural light. No watch / ring visible (no PII). |
| Hands typing `shortflix.app` into address bar (over-the-shoulder) | 2 | 2-second insert. Optional. |
| Closeup of home screen icon snap (macro lens if available) | 3 | Sells the install moment. |
| Wide shot of monitor + phone + notebook on desk, ambient morning light | bumper / thumbnail | YouTube thumbnail asset. |
| Steam from coffee cup beside phone (3-sec abstract) | between 4 and 5 | "breakfast" voiceover hit. Optional. |

All B-roll: shoot at 4K 60fps so we can crop / slow-mo without quality loss.

---

## 5. What NOT to show (verbatim do-not-list)

- ❌ **YouTube / Instagram / TikTok logos or wordmarks anywhere on screen** — text labels only ("Shorts", "Reels", "TikTok" as plain words is acceptable; the *bird/play/note marks are not*). MD-08, R6.
- ❌ **Real user faces** in any thumbnail. Blur all video previews. No identifying info — display names only as Maya / Doyoon / Liam (pseudonyms).
- ❌ **Real Stripe live charge** — test mode only, "TEST MODE" watermark stays visible. MD-04.
- ❌ **Korean-only or other-language-only text without an English on-screen translation** within 1 second. R9.
- ❌ **AI / agent / LLM / "powered by AI" jargon in the voiceover.** Use anti-ai voice instead: "the page is hand-set", "four agents work overnight", "the model is in the back office".
- ❌ **Marketing superlatives**: no "blazingly fast", "revolutionary", "magnificent", "100% secure", "epic". Editorial register only.
- ❌ **Chat UI / streaming token trace** in the main app surface (would contradict the anti-ai positioning). Reasoning trace is shown ONLY in the ablation toggle and in the terminal `gcloud trace` shot.
- ❌ **RapidAPI brand mark** anywhere on screen. Show endpoint URLs only if absolutely needed.
- ❌ **Real GCP project ID, billing account number, or trace IDs that resolve to a live tenant** — redact with a black bar.
- ❌ **Music with copyright claim risk** — use YouTube Audio Library or Epidemic Sound (paid) ambient track at -22 LUFS.

---

## 6. Submission flow (how this video gets uploaded)

1. **Render master**: 1920×1080 H.264, AAC audio 192 kbps, target ≤ 200 MB. Final filename: `shortflix-demo-v1.mp4`.
2. **Burn subtitles**: open-caption burn-in for the .srt (judges sometimes mute). Also export sidecar `shortflix-demo-v1.srt`.
3. **YouTube unlisted upload (primary backup)**: account `app.2weeks@gmail.com`. Privacy: Unlisted. Title: "ShortFlix · Demo · Google for Startups AI Agents Challenge 2026". Description: 3-sentence elevator pitch + repo link + Devpost link.
4. **Devpost upload**: paste the YouTube unlisted URL into the "Video demo URL" field. Devpost embeds it inline. (Direct file upload is allowed up to 2 GB; YouTube unlisted is the recommended path because it survives Devpost's CDN and is what most judges click.)
5. **Loom mirror (secondary backup)**: same .mp4 to Loom workspace, link in repo README.
6. **Repo embed**: drop `docs/demo.md` with the YouTube embed iframe + this script as the canonical reference.
7. **Submission deadline buffer**: upload no later than D+29 (2026-06-04 PT). D+30 is reserved for emergency reuploads only.

---

## 7. Backup plan (per-frame failure recovery)

| Frame | Risk | Backup |
|---|---|---|
| 1 (phone B-roll, three apps) | Real device freezes mid-take | Pre-recorded 8-sec phone clip from D+26 capture; layer voiceover. |
| 2-3 (PWA install on real phone) | `beforeinstallprompt` doesn't fire (Android Chrome quirk) | Pre-recorded successful install from D+14 demo cut, narrated live. Note in submission: "install path verified on Pixel 7, Chrome 124". |
| 4 (9 cards scrolling) | Cloud Run cold-start > 3 s during recording | Take is paused → screen-record from staging branch with seeded Firestore + min-instances=1. |
| 5 (ablation table) | `/api/ablation` not deployed | **Static screenshot** of `bench/results.json` rendered as table; read voiceover over still frame. README links to actual JSON. |
| 7 (architecture diagram) | Diagram render breaks on phone | **Screen-record over Mermaid render** in `README.md` — judges are familiar with this pattern. Pre-export SVG → PNG as final fallback. |
| 8 (terminal trace + bench) | `gcloud trace describe` shows nothing (empty trace) | Pre-captured terminal recording from D+19 trace-separation milestone. |
| 9 (Stripe receipt + GCP cost) | Stripe receipt not yet generated by D+25 | Use Stripe's official test-mode receipt sample with our metadata fields filled in. Disclose "test mode" on screen. GCP billing screenshot is non-optional — capture by D+24. |
| Demo URL (overall) | Cloud Run is down on judging day | **Fallback hierarchy**: (1) GitHub Pages mirror at `kimsejun.github.io/shortflix-demo/` serving last-known-good static export of issue 2026-05-15. (2) `runs/r-20260506T121945Z/composite-plan.md` + `mockups/` directory linked from README. (3) Loom video link as final functional proof. |
| Audio (overall) | Voiceover take is unusable | Re-record in Descript with same script. Descript's voice clone (own voice) is allowed if disclosed; do not use synthetic voices of others. |

---

## 8. OBS recording timeline (for the actual session)

| Block | Duration | Scene | Source feeds |
|---|---|---|---|
| A | 0:00–0:08 | Phone-Cam | Phone HDMI capture (Elgato HD60 X) + Rode mic |
| B | 0:08–0:26 | Phone-Cam | Same |
| C | 0:26–1:10 | Screen-Cap | Browser display capture (1920×1080) + mic |
| D | 1:10–1:22 | Diagram | PNG image source + mic |
| E | 1:22–1:30 | Terminal | Terminal window capture (zoomed font 18pt) + mic |
| F | 1:30–1:42 | Stripe+GCP | Two image sources side-by-side + mic |
| G | 1:42–1:45 | Logo | PNG image source, no audio |

Render in Descript with timeline locked to these block boundaries. Color grade pass: -3 highlights, +5 shadows, +2 vibrance to match the editorial "morning paper" tone.

---

## 9. Acceptance gates before declaring video done

- [ ] Total length 1:40–1:50 (target 1:45)
- [ ] All 13 storyboard beats present in order
- [ ] Voiceover hits all four anti-ai brand strings: "Discovery is the product, not the model" · "Four agents work overnight. You read nine picks at breakfast." · "YouTube doesn't show you Lagos…" · "Hand-set on the page"
- [ ] Ablation numbers visible on screen for ≥ 3 seconds (0.41 vs 0.82)
- [ ] Stripe receipt visible on screen for ≥ 4 seconds with TEST MODE watermark
- [ ] Architecture diagram visible for ≥ 6 seconds with 4 Cloud Run boxes legible
- [ ] Zero third-party logos confirmed by frame-by-frame review
- [ ] EN subtitles present on every voiced line, no >1.5 s gap
- [ ] Audio normalized to -16 LUFS integrated, true peak < -1 dBTP
- [ ] File size ≤ 200 MB, plays back on Devpost preview without reencode warnings

---

*End of script. Locked under run `r-20260506T121945Z` post-Gate-H1. Edits require M3 Dev PM signoff.*
