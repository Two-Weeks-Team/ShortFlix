import type { Metadata } from "next";

import { IssueGrid } from "@/components/today/issue-grid";
import { DetailModal } from "@/components/detail/detail-modal";
import { copy } from "@/lib/copy";

export const metadata: Metadata = {
  title: "Today's issue",
  description: copy.hero.subhead,
};

export const dynamic = "force-dynamic";

/**
 * `/app/today` — primary daily-use surface (mobile-first composition).
 *
 * The grid renders 9 numbered cards with the editorial blurb up front and a
 * "✦ What did the agents do?" chip on each card. Tapping a chip opens the
 * DetailModal with the curator's rationale + an inline ablation toggle.
 *
 * RSC server component renders chrome/headers; client subtree handles state.
 */
export default function TodayPage() {
  return (
    <section aria-labelledby="today-heading" className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1
          id="today-heading"
          className="font-editorial text-2xl font-bold tracking-tight md:text-3xl"
        >
          Today&apos;s issue
        </h1>
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
          9 picks · curated overnight
        </p>
      </div>

      <IssueGrid />
      <DetailModal />
    </section>
  );
}
