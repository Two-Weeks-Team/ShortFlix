"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Renders children only on the client, after first mount. Skips SSR for any
 * subtree that depends on a Client Context (e.g., React Query, Zustand)
 * which can't be safely hydrated when the parent is rendered as RSC.
 *
 * Fallback is rendered both during SSR and on the client until hydration —
 * keep it cheap and visually consistent with the final UI.
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
