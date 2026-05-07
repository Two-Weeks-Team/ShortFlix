/**
 * Loading skeletons — used while React Query resolves the 9 picks.
 * The shimmer animation honors prefers-reduced-motion via globals.css.
 */

import { cn } from "@/lib/utils";

function Card({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-bg/60 p-4",
        className
      )}
      aria-hidden="true"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="shimmer h-3 w-12 rounded" />
        <div className="shimmer h-4 w-20 rounded-full" />
      </div>
      <div className="shimmer mb-3 aspect-[9/16] w-full rounded-xl" />
      <div className="shimmer mb-2 h-4 w-3/4 rounded" />
      <div className="shimmer h-4 w-1/2 rounded" />
    </div>
  );
}

function Grid() {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-live="polite"
      aria-label="Loading today's nine picks"
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <Card key={i} />
      ))}
    </div>
  );
}

export const Skeleton = { Card, Grid };
