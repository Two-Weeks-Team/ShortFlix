import Link from "next/link";

import { copy } from "@/lib/copy";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrustStrip } from "@/components/landing/trust-strip";
import { PersonaRotator } from "@/components/landing/persona-rotator";
import { StreakStrip } from "@/components/quest/streak-strip";

/**
 * `/` — Landing (game-designer composition; anti-ai voice).
 *
 * Above-the-fold:
 *   masthead → hero (locked title/subhead) → CTA "Begin issue 001"
 *   → trust strip (text-only ADK · Gemini · MCP · Cloud Run)
 * Below:
 *   problem framing (3 cities) → 4-quest preview → streak strip → footer.
 *
 * RSC by default — no client-side fetch on this page (just a static editorial
 * surface), keeping first-load JS minimal.
 */
export default function LandingPage() {
  return (
    <main id="main" className="flex-1">
      <header className="border-b border-border">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <p className="font-editorial text-2xl font-bold tracking-tight">
              {copy.brand}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
              {copy.tagline}
            </p>
          </div>
          <Link
            href="/app/today"
            className="font-mono text-xs text-muted underline-offset-4 hover:text-fg hover:underline"
          >
            Open today&apos;s issue →
          </Link>
        </div>
      </header>

      <section className="container py-10 md:py-16">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:gap-12">
          <div className="space-y-6">
            <Badge tone="muted">issue 001 · 2026-05-07</Badge>
            <h1 className="font-editorial text-4xl font-bold leading-tight tracking-tight md:text-masthead">
              {copy.hero.title}
            </h1>
            <p className="text-lg text-muted md:text-xl">
              {copy.hero.subhead}
            </p>
            <p className="text-base leading-relaxed text-fg/90">
              {copy.hero.problem}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button asChild size="lg" variant="primary">
                <Link href="/app/today">{copy.hero.cta}</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/app/today#why">{copy.hero.ctaSecondary}</Link>
              </Button>
            </div>
            <PersonaRotator />
          </div>

          <aside className="space-y-4">
            <StreakStrip />
            <div className="rounded-2xl border border-border bg-bg/60 p-4">
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
                Today&apos;s posture
              </p>
              <ul className="mt-3 space-y-1 text-sm">
                <li className="flex justify-between">
                  <span>Regions</span>
                  <span className="font-mono">3 / 195</span>
                </li>
                <li className="flex justify-between">
                  <span>Platform mix</span>
                  <span className="font-mono">3-3-3</span>
                </li>
                <li className="flex justify-between">
                  <span>Novelty target</span>
                  <span className="font-mono">0.80</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-border bg-bg/40">
        <div className="container py-10 md:py-14">
          <h2 className="font-editorial text-2xl font-bold">
            {copy.quests.title}
            <span className="ml-2 font-mono text-sm font-normal text-muted">
              {copy.quests.subtitle}
            </span>
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(
              ["CARTOGRAPHER", "DIVERSIFIER", "RECEIPT_READER", "TIER_II"] as const
            ).map((id) => {
              const item = copy.quests.items[id];
              const locked = id === "TIER_II";
              return (
                <li
                  key={id}
                  className="rounded-2xl border border-border bg-bg/60 p-4"
                >
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                    {id.replace("_", " ")}
                    {locked && (
                      <span className="ml-2 text-warn">· locked</span>
                    )}
                  </p>
                  <h3 className="mt-2 font-editorial text-base font-semibold">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-sm text-muted">{item.blurb}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-6">
          <TrustStrip />
          <p className="font-mono text-[11px] text-muted">
            © {new Date().getFullYear()} {copy.brand}
          </p>
        </div>
      </footer>
    </main>
  );
}
