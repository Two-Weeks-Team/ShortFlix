"use client";

import { useEffect } from "react";

/**
 * Registers /sw.js on first paint. Idempotent — browser dedupes registrations
 * by scope. Failures are swallowed (offline-yesterday is a nice-to-have, not a
 * blocking feature; G9 in composite-plan).
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV === "development") return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch(() => {
        /* swallow — offline cache is best-effort */
      });
  }, []);
  return null;
}
