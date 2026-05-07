"use client";

import { useAblation } from "@/lib/hooks";
import { copy } from "@/lib/copy";
import { Badge } from "@/components/ui/badge";
import { novelty } from "@/lib/utils";

/**
 * Drop-one-agent ablation table (MD-01).
 *
 * Rendered as an actual <table> with row headers so screen readers can read it
 * as tabular data. Visual emphasis on the dropped agent + the novelty collapse
 * relative to baseline (0.82).
 */
export function AblationTable({ issueDate }: { issueDate?: string }) {
  const { data, isLoading, error } = useAblation(issueDate);

  if (isLoading) {
    return (
      <p className="text-sm text-muted" aria-live="polite">
        {copy.states.loading}
      </p>
    );
  }
  if (error || !data) {
    return (
      <p className="text-sm text-warn" role="alert">
        {copy.states.error}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">{copy.ablation.description}</p>
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">{copy.ablation.title}</caption>
        <thead>
          <tr className="text-left font-mono text-[11px] uppercase tracking-wider text-muted">
            <th scope="col" className="border-b border-border py-2 pr-2">
              {copy.ablation.columns.droppedAgent}
            </th>
            <th scope="col" className="border-b border-border py-2 pr-2">
              {copy.ablation.columns.noveltyScore}
            </th>
            <th scope="col" className="border-b border-border py-2">
              {copy.ablation.columns.pickOverlap}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-accent/10">
            <th
              scope="row"
              className="py-2 pr-2 font-medium text-fg"
            >
              full pipeline
            </th>
            <td className="py-2 pr-2">
              <Badge tone="accent">{novelty(data.baselineNovelty)}</Badge>
            </td>
            <td className="py-2 text-muted">1.00</td>
          </tr>
          {data.rows.map((r) => {
            const collapseRatio = r.noveltyScore / data.baselineNovelty;
            const tone = collapseRatio < 0.6 ? "warn" : "muted";
            return (
              <tr key={r.droppedAgent} className="border-t border-border/60">
                <th
                  scope="row"
                  className="py-2 pr-2 font-medium text-fg"
                >
                  {copy.ablation.agents[r.droppedAgent]}
                </th>
                <td className="py-2 pr-2">
                  <Badge tone={tone}>{novelty(r.noveltyScore)}</Badge>
                </td>
                <td className="py-2 text-muted">
                  {(r.pickOverlap * 100).toFixed(0)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
