"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { copy } from "@/lib/copy";
import { useCompleteQuest } from "@/lib/hooks";
import type { QuestProgressItem } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * One quest row — Cartographer · Diversifier · Receipt-Reader · Tier-II.
 *
 * Visuals borrow from game-designer mockup (rounded gradient icon, progress bar,
 * gold-on-purple reward chip), but ALL copy comes from copy.ts (anti-ai voice
 * — "Visit a region you haven't" not "Earn that badge!").
 */
export function QuestCard({ quest }: { quest: QuestProgressItem }) {
  const meta = copy.quests.items[quest.questId];
  const { mutate, isPending } = useCompleteQuest();
  const pct = Math.min(100, (quest.progress / quest.target) * 100);
  const locked = quest.questId === "TIER_II" && !quest.completed && pct < 100;

  return (
    <Card aria-label={meta.name} className={locked ? "opacity-60" : ""}>
      <Card.Body className="grid grid-cols-[44px_1fr_auto] items-center gap-3">
        <div
          aria-hidden="true"
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl text-base font-black",
            quest.completed
              ? "bg-gradient-to-br from-grass to-sky text-[#0a3a14]"
              : "bg-gradient-to-br from-pop to-gold text-[#1c0a2a]"
          )}
        >
          {quest.completed ? "✓" : "★"}
        </div>

        <div className="min-w-0">
          <h4 className="truncate text-sm font-semibold text-fg">
            {meta.name}
          </h4>
          <p className="mt-0.5 text-xs text-muted">{meta.blurb}</p>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded bg-border/60"
            role="progressbar"
            aria-valuenow={quest.progress}
            aria-valuemin={0}
            aria-valuemax={quest.target}
            aria-label={`${meta.name} progress: ${quest.progress} of ${quest.target}`}
          >
            <span
              className={cn(
                "block h-full",
                quest.completed
                  ? "bg-gradient-to-r from-grass to-sky"
                  : "bg-gradient-to-r from-grass to-sky"
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="text-right">
          <Button
            variant={quest.completed ? "secondary" : locked ? "ghost" : "primary"}
            size="sm"
            disabled={locked || isPending || quest.completed}
            onClick={() => mutate(quest.questId)}
            aria-label={
              quest.completed
                ? `${meta.name} completed`
                : locked
                  ? `${meta.name} locked`
                  : `Mark ${meta.name} complete`
            }
          >
            {quest.completed ? "Done" : locked ? "Locked" : "Mark"}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
