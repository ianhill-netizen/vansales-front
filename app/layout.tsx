import type { Metadata } from "next";
import "./globals.css";
import { fontVariables } from "./fonts";
import { SITE, siteUrl } from "@/lib/site";
import { Providers } from "@/components/providers";
import { TrackingScripts, TrackingNoScript } from "@/components/tracking-scripts";
import DkTracker from "@/components/dk-tracker";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE.name} — buy & sell vans across the UK`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — buy & sell vans across the UK`,
    description: SITE.description,
    url: "/",
  },
  twitter: { card: "summary_large_image", site: SITE.twitter },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={fontVariables}>
      <head>
        <TrackingScripts />
      </head>
      <body>
        <TrackingNoScript />
        <DkTracker />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
