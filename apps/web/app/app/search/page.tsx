import type { Metadata } from "next";

import { copy } from "@/lib/copy";

export const metadata: Metadata = { title: "Search" };

/**
 * `/app/search` — bottom-nav stub. Wires up to POST /api/search once the
 * unified-search agent is real (D+16 per composite-plan §10).
 */
export default function SearchPage() {
  return (
    <section className="space-y-4">
      <h1 className="font-editorial text-2xl font-bold tracking-tight md:text-3xl">
        {copy.nav.search}
      </h1>
      <form
        role="search"
        className="flex gap-2"
        action="/app/search"
        method="get"
      >
        <label htmlFor="q" className="sr-only">
          Search across the three platforms
        </label>
        <input
          id="q"
          name="q"
          type="search"
          placeholder="Search across Reels · Shorts · TikTok"
          className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg"
        >
          Search
        </button>
      </form>
      <p className="text-sm text-muted">{copy.states.empty}</p>
    </section>
  );
}
