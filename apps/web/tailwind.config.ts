import type { Config } from "tailwindcss";

/**
 * ShortFlix Tailwind config.
 *
 * Design tokens from runs/r-20260506T121945Z/design-approved.json (Gate H1 lock).
 * Anti-ai voice color spine + game-designer accents, expressed in OKLCH so the
 * gamut is preserved on wide-color displays. Hex fallbacks live in CSS vars.
 *
 *   --bg     #0d1117  → editorial dark canvas (anti-ai chrome)
 *   --fg     #e6edf3  → primary type
 *   --accent #6e7eff  → quiet brand accent (curator chips, why-pill)
 *   --top    #3fb950  → status / streak-active
 *   --gold   #ffd23f  → streak / XP / today-marker (game-designer)
 *   --pop    #ff5fa2  → quest reward gradient anchor
 *   --sky    #7ad9ff  → progress bar gradient end
 *   --grass  #5af28a  → done / checkmark
 *   --warn   #ff944d  → degraded / offline-yesterday strip
 *
 * NO third-party logo colors are exposed here (per MD-08).
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: ["class"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1240px" },
    },
    extend: {
      colors: {
        bg: "oklch(var(--bg-l) var(--bg-c) var(--bg-h))",
        fg: "oklch(var(--fg-l) var(--fg-c) var(--fg-h))",
        muted: "oklch(var(--muted-l) var(--muted-c) var(--muted-h))",
        border: "oklch(var(--border-l) var(--border-c) var(--border-h))",
        accent: {
          DEFAULT: "oklch(var(--accent-l) var(--accent-c) var(--accent-h))",
          fg: "oklch(0.99 0 0)",
        },
        gold: "oklch(var(--gold-l) var(--gold-c) var(--gold-h))",
        pop: "oklch(var(--pop-l) var(--pop-c) var(--pop-h))",
        sky: "oklch(var(--sky-l) var(--sky-c) var(--sky-h))",
        grass: "oklch(var(--grass-l) var(--grass-c) var(--grass-h))",
        warn: "oklch(var(--warn-l) var(--warn-c) var(--warn-h))",
        top: "oklch(var(--top-l) var(--top-c) var(--top-h))",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "-apple-system",
          "BlinkMacSystemFont",
          "Inter",
          "Pretendard",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "monospace",
        ],
        editorial: [
          "ui-serif",
          "Iowan Old Style",
          "Apple Garamond",
          "Georgia",
          "serif",
        ],
      },
      fontSize: {
        masthead: ["2.5rem", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
      },
      borderRadius: {
        lg: "0.875rem",
        xl: "1rem",
        "2xl": "1.25rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 240ms ease-out",
        shimmer: "shimmer 1800ms linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
