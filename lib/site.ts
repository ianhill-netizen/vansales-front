/* Site-wide constants. Base URL is environment-driven so canonical/OG URLs are
   correct on Vercel previews and (eventually) production. */
export const SITE = {
  name: "Vansales",
  domain: "vansales.com",
  tagline: "The UK's straight-talking van marketplace",
  description:
    "Buy used and new vans from trusted UK dealers and private sellers. Compare panel vans, dropsides, Lutons and crew cabs by payload, wheelbase, price and ULEZ status.",
  twitter: "@vansales",
} as const;

/** Where "Sell your van" goes: the seller app (sell.vansales.com). Overridable per environment. */
export const SELL_URL = process.env.NEXT_PUBLIC_SELL_URL || "https://sell.vansales.com";
/** Where "Sell your van" links go: the final destination of the bare address (which 307s here), so there is no redirect hop. */
export const SELL_SIGNUP_URL = `${SELL_URL.replace(/\/$/, "")}/signup/private`;

/** Absolute base URL for the running deployment (no trailing slash). */
export function siteUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
  return (fromEnv || "http://localhost:3000").replace(/\/$/, "");
}

export function absUrl(path: string): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/** The Vansales logo as an absolute, crawlable URL (public/logo.svg: the same file the site header renders). One source for every Organization in JSON-LD. */
export const ORG_LOGO_URL = absUrl("/logo.svg");

/** The shared schema.org Organization object: name, url and logo. Spread it where a page needs the Vansales organisation (Article author and publisher, the home page). */
export const ORGANIZATION_SCHEMA = {
  "@type": "Organization",
  name: SITE.name,
  url: absUrl("/"),
  logo: { "@type": "ImageObject", url: ORG_LOGO_URL },
} as const;

/** Default share image for pages that set their own openGraph/twitter metadata (a page-level openGraph replaces the root layout's, so the file-based image has to be named again). */
export const DEFAULT_OG_IMAGES = [{ url: absUrl("/opengraph-image"), width: 1200, height: 630, alt: `${SITE.name}: ${SITE.tagline}` }];
export const DEFAULT_TWITTER_IMAGES = [{ url: absUrl("/twitter-image"), width: 1200, height: 630, alt: `${SITE.name}: ${SITE.tagline}` }];
