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
