"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SourceBadge } from "@/components/today/source-badge";
import { copy } from "@/lib/copy";
import { useUi } from "@/lib/store";
import type { Pick } from "@/lib/types";
import { langLabel, novelty, regionLabel } from "@/lib/utils";

/**
 * One of the 9 numbered cards on /app/today.
 *
 * Compound layout:
 *  [position] · [9:16 thumbnail] · [region | source | lang]
 *  ── editorial blurb ──
 *  [why-chip → opens detail modal]
 *
 * Keyboard: focusable as a button; Enter/Space opens detail.
 * a11y: alt text from Pick.altText (REQUIRED at the API layer).
 */
export function IssueCard({ pick }: { pick: Pick }) {
  const openPick = useUi((s) => s.openPick);

  return (
    <Card
      role="article"
      aria-labelledby={`pick-${pick.id}-title`}
      className="flex flex-col"
    >
      <Card.Header>
        <div className="flex items-center justify-between">
          <span
            className="font-mono text-xs text-muted"
            aria-label={`Position ${pick.position} of 9`}
          >
            {String(pick.position).padStart(2, "0")} / 09
          </span>
          <Badge tone="accent">novelty {novelty(pick.noveltyScore)}</Badge>
        </div>
      </Card.Header>

      <Card.Body className="flex flex-col gap-3">
        <div
          className="relative aspect-[9/16] overflow-hidden rounded-xl border border-border bg-gradient-to-br from-[#1a1140] via-[#0d1117] to-black"
          role="img"
          aria-label={pick.altText}
        >
          {/* Real <img> would go here once thumbnailUrl is from a real CDN.
              Using a styled placeholder keeps demo runnable + Lighthouse-clean
              without flaky external fetches in CI. */}
          <div className="absolute inset-0 flex items-center justify-center text-muted/60">
            <span className="font-editorial text-4xl">{pick.region}</span>
          </div>
          <div className="absolute left-2 top-2 flex gap-1.5">
            <SourceBadge platform={pick.platform} />
          </div>
          <div className="absolute right-2 top-2">
            <Badge tone="muted">{pick.durationSec}s</Badge>
          </div>
        </div>

        <h3
          id={`pick-${pick.id}-title`}
          className="font-editorial text-base leading-snug text-fg"
        >
          {pick.blurb}
        </h3>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="muted">{regionLabel(pick.region)}</Badge>
          <Badge tone="muted">{langLabel(pick.sourceLang)}</Badge>
        </div>
      </Card.Body>

      <Card.Footer>
        <button
          type="button"
          onClick={() => openPick(pick.id)}
          className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[11px] text-accent transition hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          aria-haspopup="dialog"
          aria-controls={`pick-detail-${pick.id}`}
        >
          ✦ {copy.states.skeptic}
        </button>
        <span className="text-[11px] text-muted">tap to open</span>
      </Card.Footer>
    </Card>
  );
}
