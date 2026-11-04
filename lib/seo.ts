import type { Metadata } from "next";
import { SITE } from "@/lib/site";

/** Full page metadata in one place: title, description, canonical, Open Graph and Twitter. Keeps pages from inheriting the site-wide defaults by accident. */
export function pageMeta({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: SITE.name, title: `${title} · ${SITE.name}`, description, url: path },
    twitter: { card: "summary_large_image", title: `${title} · ${SITE.name}`, description },
  };
}

/** For pages that must stay out of search (account areas, sign-up forms, internal tools). */
export const NOINDEX: Metadata = { robots: { index: false, follow: false } };
