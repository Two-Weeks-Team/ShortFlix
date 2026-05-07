/**
 * ShortFlix service worker — offline-yesterday strategy (composite-plan G9).
 *
 * Caches:
 *   sf-shell-v1   precaches the app shell so the home-screen icon opens fast.
 *   sf-issue-v1   stores the most recent successful /api/today response so an
 *                 offline reopen still shows yesterday's nine cards.
 *
 * Strategy: shell → cache-first; /api/today → stale-while-revalidate; other
 * navigation → network with cache fallback. Out-of-scope requests bypass.
 */

const SHELL_CACHE = "sf-shell-v1";
const ISSUE_CACHE = "sf-issue-v1";
const SHELL_ASSETS = [
  "/",
  "/app/today",
  "/app/quest",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== ISSUE_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Cross-origin: bypass.
  if (url.origin !== self.location.origin) return;

  // /api/today/* — stale-while-revalidate so offline-yesterday works.
  if (url.pathname.startsWith("/api/today")) {
    event.respondWith(
      caches.open(ISSUE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Navigation requests — network-first, fall back to cached shell.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() =>
          caches.match(request).then((m) => m || caches.match("/app/today"))
        )
    );
    return;
  }

  // Static assets — cache-first.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        if (res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(request, copy));
        }
        return res;
      });
    })
  );
});
