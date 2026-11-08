/**
 * The copy behind the landing pages: one vansales-backend content_pages row each (page_type guide, written by Gemini).
 *   GET {VANSALES_API_URL}/api/public/content/pages/{slug}   {data:{h1,body_html,word_count,published_at,page_type}}  (404 = not published)
 * Read-only, server-side, cached 5 minutes. An outage must never cache a 404: a page that cannot be fetched is "unavailable" and the render errors (ISR keeps the last good page).
 */
import { getJson } from "@/lib/content/backend";
import { sanitizeGuideHtml } from "@/lib/content/sanitize";
import { LANDING_PAGES, type LandingDef } from "@/lib/landing-pages";

/** The body of ONE backend guide row by slug, for a hand-built route that shows it under its own content (HAND_BUILT_GUIDE_SLUGS). Null when unpublished or the API is down: the route then renders as it did before. */
export async function getGuideBodyHtml(slug: string): Promise<string | null> {
  const res = await getJson(`/api/public/content/pages/${encodeURIComponent(slug)}`);
  if (!res || res.status !== 200) return null;
  const r = (res.json as { data?: unknown } | null)?.data as Record<string, unknown> | undefined;
  if (!r || typeof r !== "object" || str(r.body_html).trim() === "") return null;
  return sanitizeGuideHtml(str(r.body_html));
}

const str = (v: unknown): string => (typeof v === "string" ? v : "");

export type LandingResult = { status: "ok"; bodyHtml: string; published: string; modified: string } | { status: "missing" } | { status: "unavailable" };

export async function getLandingBody(def: LandingDef): Promise<LandingResult> {
  const res = await getJson(`/api/public/content/pages/${encodeURIComponent(def.backendSlug)}`);
  if (!res) return { status: "unavailable" };
  if (res.status === 404) return { status: "missing" };
  const r = (res.json as { data?: unknown } | null)?.data as Record<string, unknown> | undefined;
  if (!r || typeof r !== "object" || str(r.body_html).trim() === "") return { status: "missing" };
  return { status: "ok", bodyHtml: sanitizeGuideHtml(str(r.body_html)), published: str(r.published_at), modified: str(r.updated_at) || str(r.published_at) };
}

/** Backend slugs of the landing pages that are published. [] when the API is down (the sitemap then omits them). */
export async function getLiveLandingSlugs(): Promise<Set<string>> {
  const live = new Set<string>();
  await Promise.all(LANDING_PAGES.map(async (d) => {
    const r = await getLandingBody(d).catch(() => ({ status: "unavailable" as const }));
    if (r.status === "ok") live.add(d.backendSlug);
  }));
  return live;
}
