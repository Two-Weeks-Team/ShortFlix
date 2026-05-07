import type { Metadata } from "next";

import { copy } from "@/lib/copy";

export const metadata: Metadata = { title: "Saved" };

/**
 * `/app/saved` — bottom-nav stub. Will hydrate once event/save endpoints land.
 */
export default function SavedPage() {
  return (
    <section className="space-y-4">
      <h1 className="font-editorial text-2xl font-bold tracking-tight md:text-3xl">
        {copy.nav.saved}
      </h1>
      <p className="rounded-2xl border border-border bg-bg/40 p-6 text-sm text-muted">
        {copy.states.empty}
      </p>
    </section>
  );
}
