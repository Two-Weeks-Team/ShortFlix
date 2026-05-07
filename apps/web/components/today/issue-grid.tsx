"use client";

import { useTodayIssue } from "@/lib/hooks";
import { copy } from "@/lib/copy";
import { IssueCard } from "@/components/today/issue-card";
import { Skeleton } from "@/components/today/skeleton";

/**
 * The 9-card grid for /app/today.
 *
 * Suspense boundary lives in the page; this component handles its own
 * loading/error/empty visual states.
 */
export function IssueGrid() {
  const { data, isLoading, error } = useTodayIssue();

  if (isLoading) return <Skeleton.Grid />;

  if (error) {
    return (
      <p
        role="alert"
        className="rounded-2xl border border-warn/40 bg-warn/10 p-4 text-sm text-warn"
      >
        {copy.states.error}
      </p>
    );
  }

  if (!data || data.picks.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-bg/40 p-4 text-sm text-muted">
        {copy.states.empty}
      </p>
    );
  }

  return (
    <ol
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Today's nine picks"
    >
      {data.picks.map((p) => (
        <li key={p.id} className="contents">
          <IssueCard pick={p} />
        </li>
      ))}
    </ol>
  );
}
