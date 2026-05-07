"use client";

import { useStreak } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * Streak visual — used on landing hero AND /app/quest dashboard.
 *
 * Renders 10 day-cells (last 6 + today + 3 future) with the current day
 * highlighted in gold. Game-designer overlay; copy stays editorial.
 *
 * a11y: rendered as an ordered list with day-of-week + status text content
 * so screen readers announce "Monday, completed; Tuesday, today" etc.
 */
export function StreakStrip() {
  const { data: streak } = useStreak();
  const days = streak?.currentDays ?? 0;

  // Render a fixed 10-cell window: 6 done · today · 3 future (or what fits).
  const cells = Array.from({ length: 10 }, (_, i) => i - 6); // -6..3

  return (
    <section
      aria-label={`Daily streak: ${days} days`}
      className="rounded-2xl border border-border bg-bg/60 p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted">
          Daily streak
        </h3>
        <span className="font-mono text-xs text-gold">
          ★ {days} days
        </span>
      </div>
      <ol className="flex gap-1.5">
        {cells.map((offset) => {
          const state =
            offset < 0 ? "done" : offset === 0 ? "today" : "future";
          const labels = ["M", "T", "W", "T", "F", "S", "S", "M", "T", "W"];
          return (
            <li
              key={offset}
              aria-label={
                state === "today"
                  ? "Today, current day"
                  : state === "done"
                    ? "Past day, completed"
                    : "Upcoming day"
              }
              className={cn(
                "flex-1 rounded-lg border py-2 text-center text-[11px] font-semibold",
                state === "done" &&
                  "border-pop/40 bg-pop/10 text-fg",
                state === "today" &&
                  "border-gold bg-gold text-[#1c0a2a] shadow-[0_0_0_2px_oklch(var(--gold-l)_var(--gold-c)_var(--gold-h)/0.3)]",
                state === "future" &&
                  "border-border bg-transparent text-muted opacity-60"
              )}
            >
              {state === "today" ? "★" : labels[(offset + 6) % 10]}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
