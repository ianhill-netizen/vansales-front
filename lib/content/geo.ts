/** The Gemini guide behind a nation / region / city page: vansales-backend content_pages row `vans-for-sale-{key}` (page_type regional). Read-only, server-side; an outage errors the render, a missing row is a 404 (never a thin page). */
import { getJson } from "@/lib/content/backend";
import { sanitizeGuideHtml } from "@/lib/content/sanitize";
import { GEO_NODES, geoBackendSlug } from "@/lib/geo/tree";

const str = (v: unknown): string => (typeof v === "string" ? v : "");

export type GeoBody = { status: "ok"; bodyHtml: string; published: string; modified: string } | { status: "missing" } | { status: "unavailable" };

export async function getGeoBody(key: string): Promise<GeoBody> {
  const res = await getJson(`/api/public/content/pages/${encodeURIComponent(geoBackendSlug(key))}`);
  if (!res) return { status: "unavailable" };
  if (res.status === 404) return { status: "missing" };
  const r = (res.json as { data?: unknown } | null)?.data as Record<string, unknown> | undefined;
  if (!r || typeof r !== "object" || str(r.body_html).trim() === "") return { status: "missing" };
  return { status: "ok", bodyHtml: sanitizeGuideHtml(str(r.body_html)), published: str(r.published_at), modified: str(r.updated_at) || str(r.published_at) };
}

/** Keys (of the given ones, default every node) whose guide is published. {} when the API is down (the sitemap then omits them). */
export async function getLiveGeoKeys(keys: readonly string[] = GEO_NODES.map((n) => n.key)): Promise<Set<string>> {
  const live = new Set<string>();
  await Promise.all(keys.map(async (k) => {
    const r = await getGeoBody(k).catch(() => ({ status: "unavailable" as const }));
    if (r.status === "ok") live.add(k);
  }));
  return live;
}
