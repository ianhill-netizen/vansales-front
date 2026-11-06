/**
 * The copy behind the sell-my-van pages: vansales-backend sell_pages rows (a ~600-word body written by Gemini).
 *   GET {VANSALES_API_URL}/api/public/sell-pages          the published pages (slug list, for the sitemap)
 *   GET {VANSALES_API_URL}/api/public/sell-pages/{slug}   one published page: {data:{h1,meta_title,meta_description,body_html,word_count}}  (404 = not published)
 * Read-only, server-side, cached 5 minutes. An outage must never cache a 404: a page that cannot be fetched is "unavailable" and the render errors (ISR keeps the last good page).
 */
import { getJson } from "@/lib/content/backend";
import { sanitizeGuideHtml } from "@/lib/content/sanitize";
import { SELL_PAGES } from "@/lib/sell-pages";

const str = (v: unknown): string => (typeof v === "string" ? v : "");

export type SellPageResult = { status: "ok"; bodyHtml: string } | { status: "missing" } | { status: "unavailable" };

export async function getSellPageBody(slug: string): Promise<SellPageResult> {
  if (!SELL_PAGES.some((p) => p.slug === slug)) return { status: "missing" };
  const res = await getJson(`/api/public/sell-pages/${encodeURIComponent(slug)}`);
  if (!res) return { status: "unavailable" };
  if (res.status === 404) return { status: "missing" };
  const r = (res.json as { data?: unknown } | null)?.data as Record<string, unknown> | undefined;
  if (!r || typeof r !== "object" || str(r.body_html).trim() === "") return { status: "missing" };
  return { status: "ok", bodyHtml: sanitizeGuideHtml(str(r.body_html)) };
}

/** Slugs of the published sell pages that are in the allowlist. [] when the API is down (the sitemap then omits them). */
export async function getLiveSellSlugs(): Promise<Set<string>> {
  const res = await getJson("/api/public/sell-pages");
  const rows = res && res.status === 200 ? ((res.json as { data?: unknown } | null)?.data ?? []) : [];
  const allowed = new Set(SELL_PAGES.map((p) => p.slug));
  const live = new Set<string>();
  for (const row of Array.isArray(rows) ? rows : []) {
    const slug = str((row as Record<string, unknown>)?.slug);
    if (allowed.has(slug)) live.add(slug);
  }
  return live;
}
