"use client";

import { useEffect } from "react";

import { copy } from "@/lib/copy";
import { useUi } from "@/lib/store";

/**
 * Rotates between the three demo personas (Maya · Doyoon · Liam) on the
 * landing hero. 4-second interval; honours prefers-reduced-motion by stopping
 * at the first persona.
 */
export function PersonaRotator() {
  const idx = useUi((s) => s.personaIndex);
  const rotate = useUi((s) => s.rotatePersona);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const t = setInterval(rotate, 4000);
    return () => clearInterval(t);
  }, [rotate]);

  const persona = copy.personas[idx];
  return (
    <p
      className="font-mono text-xs uppercase tracking-widest text-muted"
      aria-live="polite"
    >
      e.g. <span className="text-fg">{persona.name}</span> in{" "}
      <span className="text-fg">{persona.city}</span>
      <span aria-hidden="true"> · </span>
      <span>{persona.langs.join(" / ")}</span>
    </p>
  );
}
