"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { copy } from "@/lib/copy";
import { cn } from "@/lib/utils";

/**
 * Bottom 4-tab nav for /app/* — Today · Search · Saved · Quest.
 * Sticky at the bottom of the viewport on mobile; sits inline on wide screens.
 *
 * a11y: <nav aria-label="App"> with current page marked aria-current.
 */
const items = [
  { href: "/app/today", icon: "◉", label: copy.nav.today },
  { href: "/app/search", icon: "⌕", label: copy.nav.search },
  { href: "/app/saved", icon: "✦", label: copy.nav.saved },
  { href: "/app/quest", icon: "★", label: copy.nav.quest },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="App"
      className="sticky bottom-0 z-40 mt-auto border-t border-border bg-bg/95 backdrop-blur-md"
    >
      <ul className="mx-auto flex max-w-screen-md justify-around px-3 py-2">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-[64px] flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  active ? "text-accent" : "text-muted hover:text-fg"
                )}
              >
                <span aria-hidden="true" className="text-base">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
