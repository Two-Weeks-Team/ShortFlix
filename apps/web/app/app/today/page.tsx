import type { Metadata } from "next";

import { AppShellFrame } from "@/components/app-shell/app-shell-frame";
import { ClientOnly } from "@/components/client-only";
import { IssueGrid } from "@/components/today/issue-grid";
import { DetailModal } from "@/components/detail/detail-modal";
import { copy } from "@/lib/copy";

export const metadata: Metadata = {
  title: "Today's issue",
  description: copy.hero.subhead,
};

export const dynamic = "force-dynamic";

export default function TodayPage() {
  return (
    <AppShellFrame>
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

        <ClientOnly
          fallback={
            <p className="font-mono text-xs text-muted">
              412 candidates → 9 picks. Curator is choosing.
            </p>
          }
        >
          <IssueGrid />
          <DetailModal />
        </ClientOnly>
      </section>
    </AppShellFrame>
  );
}
