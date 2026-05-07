import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Editorial pill — used for source labels (text only per MD-08), language tags,
 * region labels and the trust strip on landing.
 */
export const Badge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    tone?: "default" | "accent" | "gold" | "muted" | "warn";
  }
>(({ className, tone = "default", ...rest }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[11px] tracking-wide",
        tone === "default" && "border-border text-muted",
        tone === "accent" && "border-accent/40 bg-accent/10 text-accent",
        tone === "gold" && "border-gold/40 bg-gold/10 text-gold",
        tone === "muted" && "border-border bg-border/30 text-muted",
        tone === "warn" && "border-warn/40 bg-warn/10 text-warn",
        className
      )}
      {...rest}
    />
  );
});
Badge.displayName = "Badge";
