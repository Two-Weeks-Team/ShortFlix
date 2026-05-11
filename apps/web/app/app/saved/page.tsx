import type { Metadata } from "next";

import { AppShellFrame } from "@/components/app-shell/app-shell-frame";
import { copy } from "@/lib/copy";

export const metadata: Metadata = { title: "Saved" };

export default function SavedPage() {
  return (
    <AppShellFrame>
      <section className="space-y-4">
        <h1 className="font-editorial text-2xl font-bold tracking-tight md:text-3xl">
          {copy.nav.saved}
        </h1>
        <p className="rounded-2xl border border-border bg-bg/40 p-6 text-sm text-muted">
          {copy.states.empty}
        </p>
      </section>
    </AppShellFrame>
  );
}
