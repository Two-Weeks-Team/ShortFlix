import type { MetadataRoute } from "next";

import { copy } from "@/lib/copy";

/**
 * PWA manifest — installable, standalone, theme #0d1117.
 *
 * Path-based: served at /manifest.webmanifest by Next at build time.
 * Brand-name lazy-bind: pulls from copy.brand so a D+24 swap is one-line.
 *
 * Icons live in /public/icons; the file paths below MUST exist for Lighthouse
 * "Installable" criteria. Stub PNGs are committed alongside this file.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: copy.brand,
    short_name: copy.brand,
    description: copy.hero.subhead,
    start_url: "/app/today",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0d1117",
    theme_color: "#0d1117",
    categories: ["entertainment", "social", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
