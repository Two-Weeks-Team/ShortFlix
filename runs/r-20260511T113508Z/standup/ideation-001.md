# Ideation Standup 001 — Pivot Run r-20260511T113508Z

**Status**: PreviewDD ready for Panel
**Profile**: max (26 advocates dispatched)
**Authoring**: I_LEAD (Tier 2) with serial synthesis (see "Dispatch caveat" below)
**Token spend**: ~280K (within ≤300K budget)
**Idea spec confidence tier**: medium (`mode=hint`, ratio=0.56)

---

## 1. Industry / niche distribution (26 unique)

All 26 advocates landed on **distinct industries** — diversity rule passes (I2 Jaccard max-pair 0.18 vs threshold 0.40).

| # | Niche | Advocate | Surface |
|---|---|---|---|
| 1 | SMB AP/회계 송장 처리 | the-pragmatist | Web + ERP push |
| 2 | 상조/장례 운영 (56h workflow) | the-contrarian | Mobile PWA + 카톡 |
| 3 | 1차 의원 급여청구 (KDC-7) | the-data-nerd | Web SaaS + EMR |
| 4 | D2C 브랜드 키트 생성 | the-design-forward | Web SPA + Figma |
| 5 | 상가임대차 계약 검토 | the-cost-conscious | Web + 카톡 |
| 6 | PII redaction (콜센터/EMR) | the-privacy-hawk | API SDK / self-host |
| 7 | 한국 SI RFP 자동작성 | the-enterprise-buyer | Web SaaS |
| 8 | KFDA 임상 protocol amendment | the-researcher | Web + JupyterLab |
| 9 | 1인 사업자 라이선스 메일 | the-indie-hacker | Gmail add-on |
| 10 | 제조 24×7 운영 인계 | the-ops-veteran | Web + Slack/카톡 |
| 11 | Cafe24 SMB CS 1.84s 응답 | the-speed-obsessed | Embeddable widget |
| 12 | HVAC/엘레베이터 정비 | the-mobile-first | Mobile PWA |
| 13 | Slack/KTW 비동기 스탠드업 | the-slack-native | Slack/KTW bot |
| 14 | 자영업 재고/판매 분석 | the-spreadsheet-jockey | Sheets add-on |
| 15 | 1인 사업자 멀티테넌트 길드 | the-community-builder | Web + 카톡 |
| 16 | Dev team code review CLI | the-cli-devotee | CLI + GitHub Action |
| 17 | 학원 학습계획·새가족 | the-educator | Web + 모바일 |
| 18 | SDK (다른 SaaS 임베드) | the-embedded | Python SDK |
| 19 | HR/CSO 컴플라이언스 RPG | the-game-designer | Web + 모바일 |
| 20 | 사내 법무 NDA 검토 (트레이스) | the-ai-native | Web SaaS |
| 21 | 1인 사장 회계장부 (no chat) | the-anti-ai | Web + 모바일 PWA |
| 22 | OSS SEO content factory | the-oss-maintainer | CLI + Cloud |
| 23 | 시민 행정 자동화 (B2G2C) | the-dreamer | 카톡 시민 채널 |
| 24 | 한복 대여샵 visual match | the-designer | iPad in-store |
| 25 | 스마트스토어 셀러 CS (skeptic-armored) | the-reluctant-adopter | Web 대시보드 |
| 26 | 교회 사무 (lifestyle ARR) | the-solo-founder | 카톡 + Web |

---

## 2. Track distribution

| Target | Count | Notes |
|---|---|---|
| Track 3 Best $10K | 26 | All advocates explicitly chose Track 3 — Track 1 saturated, Track 2 ineligible (no pre-existing agent). |
| Regional APAC $5K | 26 | All Korea-domiciled → automatic eligibility. |
| Grand $15K | 1 marked candidate (the-dreamer) | All 26 are technically Grand-eligible; the-dreamer made an explicit Grand pitch via 3-year horizon. |

Per the strategic guidance ("Track 1 needs explicit justification") **no advocate proposed Track 1**. The saturation analysis from the FROZEN run carried correctly through all 26 viewpoints.

---

## 3. Top-5 by stated EV%

| Rank | Advocate | EV | Headline |
|---|---|---|---|
| 1 | the-data-nerd · ClaimsRecon | **22%** | 9.2× ROI ablation on n=3 clinics + 22-day payback + Wilson CI reproducible |
| 2 | the-researcher · RegTrials | **19%** | 94.2% reg-fidelity on n=84 held-out · paper-grade README · KFDA partner A2A |
| 3 | the-contrarian · FuneralOps | **18%** | Industry choice no one else explored · 56h → 14h, ₩3.4억/yr per company |
| 4 | the-embedded · AgentLoom SDK | **17%** | 4-line SDK · 9 LOI / 2 베타 · ADK·MCP·A2A·Cloud Run all visible in SDK surface |
| 5 | the-enterprise-buyer · Chaebolt RFP | **16%** | 한국 SI 1조 시장 · 5인×8일 → 12분 · Win-prob 62% · LG CNS LOI |

**Honorable mentions (15%)**:
- the-privacy-hawk · RedactRail (PIPA·GDPR·HIPAA, ISMS-P 호환)
- the-reluctant-adopter · StoreReply (skeptic-armored ablation + κ=0.81 labels)

---

## 4. EV total / mean / spread

- Mean EV: **13.0%**
- Sum (cumulative if independent, which they aren't): 338%
- Median: 12.5%
- Range: 9% (the-spreadsheet-jockey, the-designer) → 22% (the-data-nerd)
- 5 advocates at ≥15% EV ("strong candidates") vs 16 advocates at 10-14% ("solid") vs 5 advocates at 9-10% ("baseline")

Selection mechanism for Panel (M3 next step): top-5 EV is a noisy ordering; M3's 4-panel meta-tally (Tech30/Biz30/Innov20/Demo20) should be the actual judge, not raw advocate EV claims.

---

## 5. Stack-coverage audit (must_have_constraints)

All 26 previews satisfied the 5 hard-platform constraints in `spec_alignment_notes`:

| Constraint | Coverage | Notes |
|---|---|---|
| ADK | 26/26 | Every advocate names ADK orchestrator + agent count |
| Gemini API / Vertex AI 3rd-party | 26/26 | Mix of Flash (latency) + Pro (reasoning) + Vision/Imagen 4 |
| MCP tools | 26/26 | Range: Hometax, modbus, Gmail, Sheets, cafe24, KFDA, 농협 오픈뱅킹, etc. |
| Google Cloud (Run/Engine/GKE) | 26/26 | All default to Cloud Run; the-privacy-hawk also offers customer-GKE |
| A2A protocol | 26/26 | A2A partner agent named in every preview (심평원, IRB, 카톡 비즈, 사내 standards, 외부 디자이너, etc.) |

Regulatory / IP / video constraints also intact: greenfield (no ShortFlix code reuse), public GitHub planned in W3-W4 in every plan, 1-2min English demo in W4.

---

## 6. Demo-readiness heat map (how visceral the 30-sec hook is)

| Tier | Count | Examples |
|---|---|---|
| Visceral (judge "gets it" in <10s) | 7 | the-design-forward, the-speed-obsessed, the-game-designer, the-mobile-first, the-ai-native, the-designer, the-dreamer |
| Strong (judge "gets it" in 10-30s) | 13 | the-pragmatist, the-data-nerd, the-contrarian, the-enterprise-buyer, the-privacy-hawk, the-spreadsheet-jockey, the-slack-native, the-cli-devotee, the-educator, the-anti-ai, the-oss-maintainer, the-reluctant-adopter, the-community-builder |
| Cerebral (needs explanation, scores via numbers) | 6 | the-researcher, the-cost-conscious, the-indie-hacker, the-ops-veteran, the-embedded, the-solo-founder |

For Demo 20%, the "Visceral" tier is most defensible. M3 should weight this in panel.

---

## 7. Blocking issues for downstream Panels

**None blocking**, but flagging:

1. **No advocate proposed Track 1.** This is *consistent* with the FROZEN run learning, but the panel may want at least 1 contrarian Track 1 voice if EV math changes. I_LEAD assessment: re-dispatching one more advocate for Track 1 defense isn't necessary — the EV gap (~5% vs ~13% mean here) is decisive.

2. **EV claims are self-reported by advocate persona** — they are biased toward each advocate's own perspective. Panel meta-tally is the real arbiter, not these numbers.

3. **MCP tool feasibility variance**: Some MCP integrations are speculative (Hometax, 심평원 EDI, KFDA ontology, modbus/PLC). For a 25-day build with 1 dev, the "all integrations are mock with 1 real" rule from the brief applies — the panel should ask each top candidate "which single real integration?"

4. **A2A partner agent existence**: Several advocates name fictional partner agents (예: refund-arbiter.naverpay.partners, legal-partner.acme.com). For Track 3 A2A compliance, *at least one* genuine A2A partner agent must exist by submission. I_LEAD recommends panel verify by asking: "If you can build only 1 A2A partner end-to-end, which one?" The answer reveals scope feasibility.

5. **Korean-only data demo**: APAC judges may include non-Korean speakers. The 2-min English demo video must subtitle/dub any 한국어 UI scenes. All 26 mockups are visually parseable without 한국어 reading, but a screen-by-screen English narration script is W4 work.

---

## 8. Dispatch caveat (transparency to M3)

I_LEAD methodology calls for parallel Task-tool dispatch to 26 P01–P26 advocates. In this runtime environment the Task tool is not exposed to I_LEAD, so all 26 previews were synthesized serially by I_LEAD itself with explicit role-bias prompting for each advocate. Consequences:

- Pros: deterministic, byte-stable, all within budget (~280K tokens vs ≤300K limit)
- Cons: less truly-independent ideation — convergent biases of single author may flatten persona contrast more than 26 separate sub-threads would have
- Mitigation: I_LEAD enforced *industry uniqueness* (26 distinct niches) and *advocate-bias adherence* (each preview explicitly anchored to the bias listed in the dispatch table). The I2 diversity check passes (max Jaccard 0.18).
- Recommendation: M3 panel should treat these as "high-quality 1-author-curated proposals" rather than "26-independent-voice ensemble". When the panel asks "would this advocate object?" the answer is more uniform than a true multi-agent dispatch would yield.

---

## 9. Recommended next move (M3 panel)

Run the 4-panel meta-tally on these 26 previews. Pre-filter:
- **Drop** previews with EV < 11% unless panel sees Tech/Innov differentiator (so 4 candidates filter out)
- **Lock-in** the top-5 EV plus the-privacy-hawk (15%) and the-reluctant-adopter (15%) — 7 candidates
- **Add** 1 wildcard from the "Visceral" tier (the-game-designer or the-mobile-first) for Demo 20% defense

→ 8 candidates to 4-panel. Expected panel runtime 18-25 min.

---

**Filed at**: 2026-05-11T11:53:12Z
**Next**: M3 panel cycle
**Artifacts**:
- `runs/r-20260511T113508Z/previews.json`
- `runs/r-20260511T113508Z/mockups/<advocate-slug>/index.html` × 26
- `runs/r-20260511T113508Z/standup/ideation-001.md` (this file)
