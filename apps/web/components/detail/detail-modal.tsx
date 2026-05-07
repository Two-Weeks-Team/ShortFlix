"use client";

import { useMemo } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SourceBadge } from "@/components/today/source-badge";
import { AblationTable } from "@/components/detail/ablation-table";
import { copy } from "@/lib/copy";
import { useTodayIssue } from "@/lib/hooks";
import { useUi } from "@/lib/store";
import { langLabel, regionLabel } from "@/lib/utils";

/**
 * Pick detail modal (mobile-first × anti-ai voice).
 *
 * - Title = pick blurb
 * - Curator's one-sentence rationale shown quietly
 * - "What did the agents do?" toggle reveals AblationTable inline
 *
 * Radix Dialog handles focus trap, escape-to-close, aria-modal=true.
 */
export function DetailModal() {
  const activePickId = useUi((s) => s.activePickId);
  const closePick = useUi((s) => s.closePick);
  const ablationOpen = useUi((s) => s.ablationOpen);
  const toggleAblation = useUi((s) => s.toggleAblation);
  const { data: issue } = useTodayIssue();

  const pick = useMemo(
    () => issue?.picks.find((p) => p.id === activePickId) ?? null,
    [issue, activePickId]
  );

  const open = !!activePickId && !!pick;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) closePick();
      }}
    >
      <DialogContent
        id={pick ? `pick-detail-${pick.id}` : undefined}
        aria-describedby={pick ? `pick-detail-rationale-${pick.id}` : undefined}
      >
        {pick && (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              <SourceBadge platform={pick.platform} />
              <Badge tone="muted">{regionLabel(pick.region)}</Badge>
              <Badge tone="muted">{langLabel(pick.sourceLang)}</Badge>
            </div>

            <DialogTitle className="font-editorial text-xl leading-snug">
              {pick.blurb}
            </DialogTitle>

            <DialogDescription
              id={`pick-detail-rationale-${pick.id}`}
              className="mt-3 text-sm text-muted"
            >
              <span className="block font-mono text-[10px] uppercase tracking-wider text-muted/80">
                {copy.detail.rationaleLabel}
              </span>
              <span className="text-fg">{pick.rationale}</span>
            </DialogDescription>

            <div className="mt-5 border-t border-border pt-4">
              <button
                type="button"
                onClick={toggleAblation}
                aria-expanded={ablationOpen}
                aria-controls={`ablation-${pick.id}`}
                className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-left text-sm text-fg transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span className="font-medium">
                  ✦ {copy.states.skeptic}
                </span>
                <span className="font-mono text-xs text-muted">
                  {ablationOpen ? "▾ open" : "▸ closed"}
                </span>
              </button>

              {ablationOpen && (
                <div
                  id={`ablation-${pick.id}`}
                  className="mt-4 animate-fade-in"
                >
                  <AblationTable issueDate={issue?.issueDate} />
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <DialogClose asChild>
                <Button variant="secondary" size="sm">
                  {copy.detail.closeLabel}
                </Button>
              </DialogClose>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
