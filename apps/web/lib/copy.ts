/**
 * Centralised copy strings (anti-ai voice).
 *
 * Per Gate H1 user decision "brand-name lazy-bind", every user-facing string
 * resolves through this module. The brand name `ShortFlix` is a working name
 * locked at D+24 — swap is a one-line change at `BRAND_NAME` below.
 *
 * Strings here are LOCKED by the FE_LEAD brief. Do not paraphrase.
 */

export const BRAND_NAME = "ShortFlix";

export const copy = {
  brand: BRAND_NAME,
  tagline: "Cross-cultural short-form, hand-set on the page",

  hero: {
    title: "Discovery is the product, not the model.",
    subhead:
      "Four agents work overnight. You read nine picks at breakfast.",
    problem:
      "YouTube doesn't show you Lagos. TikTok doesn't show you Lisbon. Instagram doesn't show you Sichuan. Today's issue does.",
    solution: "A weekly, hand-set on the page — by Gemini, but quietly.",
    proof:
      "A toggle that drops one agent. Watch novelty score collapse from 0.82 to 0.41.",
    cta: "Begin issue 001",
    ctaSecondary: "What did the agents do?",
  },

  states: {
    empty: "Tomorrow's issue arrives at 06:00 your time.",
    loading: "412 candidates → 9 picks. Curator is choosing.",
    error: "The agents are off-shift. Try again in 60 seconds.",
    offline: "Offline. Yesterday's issue is still here.",
    skeptic: "What did the agents do?",
  },

  trust: {
    label: "Built on",
    items: ["ADK", "Gemini", "MCP", "Cloud Run"] as const,
  },

  quests: {
    title: "Today's quests",
    subtitle: "Three open. One locked.",
    items: {
      CARTOGRAPHER: {
        name: "The Cartographer",
        blurb:
          "Visit a region you haven't seen in 30 days. Curator already picked candidates.",
      },
      DIVERSIFIER: {
        name: "The Diversifier",
        blurb: "End the day with a 3-3-3 platform mix.",
      },
      RECEIPT_READER: {
        name: "The Receipt-Reader",
        blurb: "Tap 'why this issue?' on three picks.",
      },
      TIER_II: {
        name: "The Cartographer · Tier II",
        blurb: "Locked until Lv 8. Read five new regions in one week.",
      },
    } satisfies Record<
      "CARTOGRAPHER" | "DIVERSIFIER" | "RECEIPT_READER" | "TIER_II",
      { name: string; blurb: string }
    >,
  },

  nav: {
    today: "Today",
    search: "Search",
    saved: "Saved",
    quest: "Quest",
  },

  sources: {
    // Text labels only — NEVER use vendor logos (MD-08).
    YOUTUBE_SHORTS: "via Shorts",
    INSTAGRAM_REELS: "via Reels",
    TIKTOK: "via TikTok",
  } satisfies Record<"YOUTUBE_SHORTS" | "INSTAGRAM_REELS" | "TIKTOK", string>,

  ablation: {
    title: "What did the agents do?",
    description:
      "Drop any one agent and the novelty score collapses. The full pipeline scores 0.82.",
    columns: {
      droppedAgent: "Dropped agent",
      noveltyScore: "Novelty",
      pickOverlap: "Picks shared with full",
    },
    agents: {
      ORCHESTRATOR: "Orchestrator",
      CURATOR: "Curator",
      UNIFIED_SEARCH: "Unified-Search",
      TREND_SAFETY: "Trend-Safety",
    } as const,
  },

  detail: {
    rationaleLabel: "Curator's rationale",
    closeLabel: "Close",
    sourceBadgeLabel: "Source",
    languageLabel: "Source language",
    regionLabel: "Region",
  },

  /**
   * Demo personas for `/` landing rotation (Gate H1 user decision: 3 personas).
   * Used in the hero strip, never in real auth.
   */
  personas: [
    { name: "Maya", city: "Berlin", langs: ["en", "de"] },
    { name: "Doyoon", city: "Seoul", langs: ["ko", "en"] },
    { name: "Liam", city: "Reykjavík", langs: ["en", "is"] },
  ] as const,
} as const;

export type Copy = typeof copy;
