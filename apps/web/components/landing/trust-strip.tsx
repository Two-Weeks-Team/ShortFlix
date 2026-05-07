import { copy } from "@/lib/copy";

/**
 * Trust strip for landing — text-only "ADK · Gemini · MCP · Cloud Run".
 * No logos (anti-ai voice + MD-08 IP rule).
 */
export function TrustStrip() {
  return (
    <p
      className="font-mono text-[11px] uppercase tracking-widest text-muted"
      aria-label="Built on"
    >
      <span className="text-muted/70">{copy.trust.label}</span>{" "}
      {copy.trust.items.map((label, i) => (
        <span key={label}>
          <span className="text-fg">{label}</span>
          {i < copy.trust.items.length - 1 && (
            <span aria-hidden="true" className="mx-2 text-muted/50">
              ·
            </span>
          )}
        </span>
      ))}
    </p>
  );
}
