import type { Metadata } from "next";
import "./globals.css";
import { fontVariables } from "./fonts";
import { SITE, siteUrl } from "@/lib/site";

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
      <body>{children}</body>
    </html>
  );
}
