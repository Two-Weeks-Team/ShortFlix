"use client";

import {
  QueryClient,
  QueryClientProvider,
  type DefaultOptions,
} from "@tanstack/react-query";
import { useState } from "react";

/**
 * React Query provider for `/api/today`, `/api/quests`, `/api/ablation`.
 *
 * Defaults are tuned for "the agents work overnight" cadence:
 *  - staleTime 2 minutes for read endpoints (matches server Cache-Control: max-age=120)
 *  - retry 1 for network-blip resilience
 *  - refetchOnWindowFocus disabled (would steal focus on mobile)
 */
const defaults: DefaultOptions = {
  queries: {
    staleTime: 120_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    retry: 1,
  },
  mutations: {
    retry: 0,
  },
};

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: defaults }));
  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}
