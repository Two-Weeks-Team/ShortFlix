"use client";

import { useEffect } from "react";

import { useUi } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy";

/**
 * Captures `beforeinstallprompt` and shows a quiet 3-tap install nudge —
 * the demo-video-critical PWA path (composite-plan §6 0:18-0:28).
 *
 * Hidden on iOS Safari (which does not fire the event); on iOS the user must
 * use Share → "Add to Home Screen" — no separate UI needed because the empty
 * state copy ("install via Share menu") is implicit in the editorial chrome.
 */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const ev = useUi((s) => s.installPromptEvent) as
    | BeforeInstallPromptEvent
    | null;
  const setEv = useUi((s) => s.setInstallPromptEvent);

  useEffect(() => {
    function onBefore(e: Event) {
      e.preventDefault();
      setEv(e);
    }
    function onInstalled() {
      setEv(null);
    }
    window.addEventListener("beforeinstallprompt", onBefore);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBefore);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [setEv]);

  if (!ev) return null;

  return (
    <div
      role="region"
      aria-label="Install ShortFlix"
      className="fixed inset-x-3 bottom-20 z-30 flex items-center gap-3 rounded-2xl border border-accent/40 bg-bg/95 p-3 shadow-2xl backdrop-blur-md md:left-auto md:right-4 md:bottom-6 md:max-w-sm"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-pop font-black text-[#1c0a2a]">
        +
      </div>
      <div className="flex-1 text-xs leading-tight">
        <p className="font-semibold text-fg">Install {copy.brand}</p>
        <p className="text-muted">
          Add to home screen · works offline.
        </p>
      </div>
      <Button
        size="sm"
        onClick={async () => {
          await ev.prompt();
          await ev.userChoice;
          setEv(null);
        }}
      >
        Install
      </Button>
    </div>
  );
}
