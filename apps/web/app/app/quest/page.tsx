import type { Metadata } from "next";

import { copy } from "@/lib/copy";
import { QuestGrid } from "@/components/quest/quest-grid";
import { StreakStrip } from "@/components/quest/streak-strip";

export const metadata: Metadata = {
  title: "Quest",
  description: "Streak + 4-quest taste leveling.",
};

export const dynamic = "force-dynamic";

/**
 * `/app/quest` — full quest dashboard (Gate H1 user decision: "full" scope).
 *
 *  - StreakStrip up top
 *  - QuestGrid: Cartographer / Diversifier / Receipt-Reader / Tier-II locked
 *  - All copy editorial (anti-ai), visual treatment game-designer
 */
export default function QuestPage() {
  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-editorial text-2xl font-bold tracking-tight md:text-3xl">
          {copy.quests.title}
        </h1>
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
          {copy.quests.subtitle}
        </p>
      </header>

      <StreakStrip />
      <QuestGrid />
    </section>
  );
}
