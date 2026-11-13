/**
 * Sitemap rules, as pure functions so they can be tested without the API:
 *  - lastmod is only ever a real date that came from the content. A missing, unparseable, pre-2000 or future date is dropped (the tag is omitted), never replaced by "now" or a site-wide value.
 *  - changefreq and priority are not written: Google ignores both.
 *  - a URL appears once, in one child sitemap.
 */
export interface SitemapEntry {
  url: string;
  lastModified?: Date | string | null;
}

export const GROUPS = ["pages", "vans", "used-vans", "blog", "van-news", "dealers", "listings"] as const;
export type GroupName = (typeof GROUPS)[number];

const MIN_YEAR = 2000;
const FUTURE_SLACK_MS = 24 * 60 * 60 * 1000;

/** The W3C-datetime (ISO 8601) form of a date, or undefined when it is not a trustworthy date. */
export function validLastmod(v: Date | string | null | undefined, now: number = Date.now()): string | undefined {
  if (v == null || v === "") return undefined;
  const d = v instanceof Date ? v : new Date(v);
  const t = d.getTime();
  if (Number.isNaN(t) || d.getUTCFullYear() < MIN_YEAR || t > now + FUTURE_SLACK_MS) return undefined;
  return d.toISOString();
}

/** The newest valid lastmod of a set of entries (undefined when none has one). */
export function newestLastmod(entries: SitemapEntry[], now?: number): string | undefined {
  let best: string | undefined;
  for (const e of entries) {
    const l = validLastmod(e.lastModified, now);
    if (l && (!best || l > best)) best = l;
  }
  return best;
}

/** Which child sitemap a path belongs to. */
export function groupOf(pathname: string): GroupName {
  const p = pathname.toLowerCase();
  const under = (base: string) => p === base || p.startsWith(`${base}/`);
  if (under("/blog")) return "blog";
  if (under("/van-news")) return "van-news";
  if (under("/used-vans")) return "used-vans";
  if (p === "/dealers" || under("/dealers") || under("/dealer")) return "dealers";
  if (under("/listing")) return "listings";
  if (under("/vans")) return "vans";
  return "pages";
}

/** First occurrence wins; trailing-slash and case variants of the same path count as the same URL. */
export function dedupeEntries<T extends SitemapEntry>(entries: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const e of entries) {
    const u = new URL(e.url);
    const key = `${u.origin}${u.pathname.replace(/\/+$/, "") || "/"}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out;
}

export function splitByGroup<T extends SitemapEntry>(entries: T[]): Record<GroupName, T[]> {
  const out = Object.fromEntries(GROUPS.map((g) => [g, [] as T[]])) as Record<GroupName, T[]>;
  for (const e of entries) out[groupOf(new URL(e.url).pathname)].push(e);
  return out;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export function urlsetXml(entries: SitemapEntry[], now?: number): string {
  const rows = entries.map((e) => {
    const l = validLastmod(e.lastModified, now);
    return `<url><loc>${esc(e.url)}</loc>${l ? `<lastmod>${l}</lastmod>` : ""}</url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join("\n")}\n</urlset>\n`;
}

export function sitemapIndexXml(children: { loc: string; lastmod?: string }[]): string {
  const rows = children.map((c) => `<sitemap><loc>${esc(c.loc)}</loc>${c.lastmod ? `<lastmod>${c.lastmod}</lastmod>` : ""}</sitemap>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join("\n")}\n</sitemapindex>\n`;
}
