import { BottomNav } from "@/components/app-shell/bottom-nav";
import { InstallPrompt } from "@/components/app-shell/install-prompt";
import { copy } from "@/lib/copy";

// Shared frame for /app/* pages. Used to be apps/web/app/app/layout.tsx but
// Next.js mis-applied it to / (the root path) because of the duplicate `app`
// path segment. Now an explicit import keeps the wiring scoped.
export function AppShellFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/95 backdrop-blur-md">
        <div className="container flex items-center justify-between py-3">
          <p className="font-editorial text-lg font-bold tracking-tight">
            {copy.brand}
          </p>
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
            {copy.tagline}
          </span>
        </div>
      </header>
      <main id="main" className="container flex-1 py-6">
        {children}
      </main>
      <InstallPrompt />
      <BottomNav />
    </div>
  );
}
