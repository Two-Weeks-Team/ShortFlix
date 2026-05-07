/**
 * Client-side UI state (Zustand).
 *
 * Server state lives in React Query. Anything here is purely UI:
 *  - which detail modal is open
 *  - whether the ablation reveal toggle is on
 *  - which persona is showing in the landing rotation
 *  - install-prompt deferred event holder (PWA)
 */

"use client";

import { create } from "zustand";

interface UiState {
  /** Currently open Pick id (detail modal); null when closed. */
  activePickId: string | null;
  /** Whether the "What did the agents do?" toggle is expanded inside the modal. */
  ablationOpen: boolean;
  /** Index into copy.personas for landing rotation. */
  personaIndex: number;
  /** Stored beforeinstallprompt event for the 3-tap install path. */
  installPromptEvent: unknown | null;

  openPick: (id: string) => void;
  closePick: () => void;
  toggleAblation: () => void;
  setAblationOpen: (open: boolean) => void;
  rotatePersona: () => void;
  setInstallPromptEvent: (e: unknown | null) => void;
}

export const useUi = create<UiState>((set) => ({
  activePickId: null,
  ablationOpen: false,
  personaIndex: 0,
  installPromptEvent: null,

  openPick: (id) => set({ activePickId: id, ablationOpen: false }),
  closePick: () => set({ activePickId: null, ablationOpen: false }),
  toggleAblation: () =>
    set((s) => ({ ablationOpen: !s.ablationOpen })),
  setAblationOpen: (open) => set({ ablationOpen: open }),
  rotatePersona: () =>
    set((s) => ({ personaIndex: (s.personaIndex + 1) % 3 })),
  setInstallPromptEvent: (e) => set({ installPromptEvent: e }),
}));
