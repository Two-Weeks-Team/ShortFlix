import type { Metadata } from "next";

import { AppShellFrame } from "@/components/app-shell/app-shell-frame";
import { ClientOnly } from "@/components/client-only";
import { copy } from "@/lib/copy";
import { QuestGrid } from "@/components/quest/quest-grid";
import { StreakStrip } from "@/components/quest/streak-strip";

export const metadata: Metadata = {
  title: "Quest",
  description: "Streak + 4-quest taste leveling.",
};

export const dynamic = "force-dynamic";

export default function QuestPage() {
  return (
    <AppShellFrame>
      <section className="space-y-6">
        <header className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="font-editorial text-2xl font-bold tracking-tight md:text-3xl">
            {copy.quests.title}
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
            {copy.quests.subtitle}
          </p>
        </header>

        <ClientOnly
          fallback={
            <p className="font-mono text-xs text-muted">Loading quests…</p>
          }
        >
          <StreakStrip />
          <QuestGrid />
        </ClientOnly>
      </section>
    </AppShellFrame>
  );
}
