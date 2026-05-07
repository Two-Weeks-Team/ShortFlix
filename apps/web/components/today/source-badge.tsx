import { Badge } from "@/components/ui/badge";
import { copy } from "@/lib/copy";
import type { Platform } from "@/lib/types";

/**
 * Text-only source badge — NEVER include a vendor logo or vendor brand color
 * (per MD-08 — IP DQ avoidance).
 */
export function SourceBadge({ platform }: { platform: Platform }) {
  return (
    <Badge tone="muted" aria-label={`${copy.detail.sourceBadgeLabel}: ${copy.sources[platform]}`}>
      <span aria-hidden="true">·</span>
      <span>{copy.sources[platform]}</span>
    </Badge>
  );
}
