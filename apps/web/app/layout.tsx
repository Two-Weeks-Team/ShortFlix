import type { Metadata, Viewport } from "next";

import "./globals.css";

import { QueryProvider } from "@/lib/query-provider";
import { ServiceWorkerRegister } from "@/components/app-shell/sw-register";
import { copy } from "@/lib/copy";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ??
      "https://shortflix-web-PROJECT_ID.a.run.app"
  ),
  title: {
    default: `${copy.brand} — ${copy.tagline}`,
    template: `%s · ${copy.brand}`,
  },
  description: copy.hero.subhead,
  applicationName: copy.brand,
  appleWebApp: {
    capable: true,
    title: copy.brand,
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: `${copy.brand} — ${copy.tagline}`,
    description: copy.hero.subhead,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d1117",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <QueryProvider>
          <ServiceWorkerRegister />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
