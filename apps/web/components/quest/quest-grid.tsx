"use client";

import { useQuests } from "@/lib/hooks";
import { copy } from "@/lib/copy";
import { QuestCard } from "@/components/quest/quest-card";

export function QuestGrid() {
  const { data, isLoading, error } = useQuests();

  if (isLoading) {
    return (
      <p className="text-sm text-muted" aria-live="polite">
        {copy.states.loading}
      </p>
    );
  }
  if (error || !data) {
    return (
      <p role="alert" className="text-sm text-warn">
        {copy.states.error}
      </p>
    );
  }

  return (
    <div
      className="grid grid-cols-1 gap-3"
      aria-label={copy.quests.title}
    >
      {data.quests.map((q) => (
        <QuestCard key={q.questId} quest={q} />
      ))}
    </div>
  );
}
