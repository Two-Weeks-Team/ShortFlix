/**
 * Demo fixtures — used when the orchestrator API is unreachable (FE-only build,
 * Lighthouse audits, offline-yesterday cache priming).
 *
 * Personas reference the H1-locked Maya/Doyoon/Liam set.
 *
 * altText is REQUIRED on every Pick (a11y; per OpenAPI Pick.altText REQUIRED).
 */

import type { AblationResponse, Issue, QuestState, Streak } from "./types";

export const FALLBACK_ISSUE: Issue = {
  id: "issue_demo_001",
  issueDate: "2026-05-07",
  locale: "en",
  etag: 'W/"demo-001"',
  publishedAt: "2026-05-07T06:00:00Z",
  noveltyScore: 0.82,
  picks: [
    {
      id: "p1",
      position: 1,
      platform: "INSTAGRAM_REELS",
      videoUrl: "https://example.invalid/v/p1",
      thumbnailUrl: "https://example.invalid/t/p1.jpg",
      durationSec: 42,
      region: "PT",
      sourceLang: "pt",
      altText:
        "An elderly woman pulling fresh noodles by hand on a marble counter in a Lisbon kitchen at golden hour.",
      blurb: "할머니가 1962년에 배운 국수 뽑기. Lisbon kitchen, 0:42.",
      rationale:
        "Cross-cultural cooking: Portuguese kitchen, hand-made noodle technique passed across generations.",
      noveltyScore: 0.94,
    },
    {
      id: "p2",
      position: 2,
      platform: "YOUTUBE_SHORTS",
      videoUrl: "https://example.invalid/v/p2",
      thumbnailUrl: "https://example.invalid/t/p2.jpg",
      durationSec: 58,
      region: "NG",
      sourceLang: "yo",
      altText:
        "Two cooks tossing jollof rice over a wood fire on a Lagos rooftop at night.",
      blurb: "Lagos rooftop, jollof at midnight. The fire never sleeps.",
      rationale:
        "Lagos street food, Yoruba narration, novelty against the user's last-30-day cohort.",
      noveltyScore: 0.86,
    },
    {
      id: "p3",
      position: 3,
      platform: "TIKTOK",
      videoUrl: "https://example.invalid/v/p3",
      thumbnailUrl: "https://example.invalid/t/p3.jpg",
      durationSec: 36,
      region: "CN",
      sourceLang: "zh",
      altText:
        "A blacksmith in Sichuan hammering a curved blade in a workshop lit by a single skylight.",
      blurb: "Sichuan blacksmith. One blade, one afternoon.",
      rationale:
        "Sichuan craft, Mandarin narration, hand-skill content rare in user's feed.",
      noveltyScore: 0.79,
    },
    {
      id: "p4",
      position: 4,
      platform: "INSTAGRAM_REELS",
      videoUrl: "https://example.invalid/v/p4",
      thumbnailUrl: "https://example.invalid/t/p4.jpg",
      durationSec: 30,
      region: "IS",
      sourceLang: "is",
      altText:
        "A fisherman in Reykjavík harbour pulling up nets against a low gray sky, breath visible in the cold.",
      blurb: "Reykjavík harbour, 4 a.m. Cold hands, warm coffee.",
      rationale:
        "Icelandic coastal labour, language tag rare in user's history (is).",
      noveltyScore: 0.83,
    },
    {
      id: "p5",
      position: 5,
      platform: "YOUTUBE_SHORTS",
      videoUrl: "https://example.invalid/v/p5",
      thumbnailUrl: "https://example.invalid/t/p5.jpg",
      durationSec: 51,
      region: "BR",
      sourceLang: "pt",
      altText:
        "A capoeira circle on a Rio beach at dusk, two players moving in slow rotation while drummers keep time.",
      blurb: "Rio at dusk. The roda turns slow.",
      rationale:
        "Capoeira tradition, Brazilian Portuguese, novelty score 0.81.",
      noveltyScore: 0.81,
    },
    {
      id: "p6",
      position: 6,
      platform: "TIKTOK",
      videoUrl: "https://example.invalid/v/p6",
      thumbnailUrl: "https://example.invalid/t/p6.jpg",
      durationSec: 28,
      region: "JP",
      sourceLang: "ja",
      altText:
        "A train conductor bowing to passengers as a Shinkansen pulls out of Kyoto station at dawn.",
      blurb: "Kyoto station, 5:42. The bow is older than the train.",
      rationale: "Japanese rail-service ritual, daily-life formality.",
      noveltyScore: 0.74,
    },
    {
      id: "p7",
      position: 7,
      platform: "INSTAGRAM_REELS",
      videoUrl: "https://example.invalid/v/p7",
      thumbnailUrl: "https://example.invalid/t/p7.jpg",
      durationSec: 44,
      region: "IN",
      sourceLang: "ta",
      altText:
        "A flower vendor in Chennai weaving jasmine into long garlands at a covered market stall.",
      blurb: "Chennai market. Jasmine by the meter.",
      rationale: "Tamil Nadu market trade, Tamil narration.",
      noveltyScore: 0.78,
    },
    {
      id: "p8",
      position: 8,
      platform: "YOUTUBE_SHORTS",
      videoUrl: "https://example.invalid/v/p8",
      thumbnailUrl: "https://example.invalid/t/p8.jpg",
      durationSec: 39,
      region: "ZA",
      sourceLang: "zu",
      altText:
        "A choir rehearsing in a Johannesburg church hall, late afternoon light through tall windows.",
      blurb: "Johannesburg choir, Tuesday 4 p.m. Practice is the show.",
      rationale: "Zulu choir tradition, communal practice scene.",
      noveltyScore: 0.85,
    },
    {
      id: "p9",
      position: 9,
      platform: "TIKTOK",
      videoUrl: "https://example.invalid/v/p9",
      thumbnailUrl: "https://example.invalid/t/p9.jpg",
      durationSec: 33,
      region: "MX",
      sourceLang: "es",
      altText:
        "Sunrise over Oaxaca rooftops with a vendor setting up a tlayuda griddle on a quiet street.",
      blurb: "Oaxaca, 6:30. The griddle warms before the city does.",
      rationale: "Oaxacan street breakfast, Spanish narration.",
      noveltyScore: 0.8,
    },
  ],
};

export const FALLBACK_ABLATION: AblationResponse = {
  issueDate: "2026-05-07",
  baselineNovelty: 0.82,
  rows: [
    { droppedAgent: "ORCHESTRATOR", noveltyScore: 0.66, pickOverlap: 0.55 },
    { droppedAgent: "CURATOR", noveltyScore: 0.41, pickOverlap: 0.22 },
    { droppedAgent: "UNIFIED_SEARCH", noveltyScore: 0.52, pickOverlap: 0.4 },
    { droppedAgent: "TREND_SAFETY", noveltyScore: 0.69, pickOverlap: 0.61 },
  ],
};

export const FALLBACK_QUESTS: QuestState = {
  forDate: "2026-05-07",
  quests: [
    {
      questId: "CARTOGRAPHER",
      progress: 0,
      target: 1,
      completed: false,
      labelKey: "quest.cartographer",
    },
    {
      questId: "DIVERSIFIER",
      progress: 5,
      target: 9,
      completed: false,
      labelKey: "quest.diversifier",
    },
    {
      questId: "RECEIPT_READER",
      progress: 3,
      target: 3,
      completed: true,
      labelKey: "quest.receipt_reader",
      completedAt: "2026-05-07T09:14:00Z",
    },
    {
      questId: "TIER_II",
      progress: 1,
      target: 5,
      completed: false,
      labelKey: "quest.tier_ii",
    },
  ],
};

export const FALLBACK_STREAK: Streak = {
  currentDays: 14,
  longestDays: 21,
  freezeTokens: 1,
  lastTickAt: "2026-05-07T08:00:00Z",
};
