/**
 * The make hub pages behind /used-vans/{make}: vansales-backend content_pages rows of page_type make_hub, slug = the make slug ("ford", "mercedes-benz"), written by Gemini (content:seo-silo hubs).
 *   GET {VANSALES_API_URL}/api/public/content/pages/{slug}                 one published page: {data:{h1,meta_title,meta_description,body_html,make,page_type,...}}
 *   GET {VANSALES_API_URL}/api/public/content/pages?page_type=make_hub     the list (slugs), for the sitemap
 * Read-only, server-side, cached 5 minutes. An outage must never break the site: the sitemap falls back to nothing and a page that cannot be fetched is "unavailable" (never a cached 404).
 */
import { getJson } from "@/lib/content/backend";
import { sanitizeGuideHtml } from "@/lib/content/sanitize";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const str = (v: unknown): string => (typeof v === "string" ? v : "");

export interface MakeHub {
  slug: string;
  make: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  /** Sanitised: allow-listed tags, no attributes except the two internal links the writer is allowed. */
  bodyHtml: string;
  published: string;
  modified: string;
}

export type MakeHubResult = { status: "ok"; hub: MakeHub } | { status: "missing" } | { status: "unavailable" };

export async function getMakeHub(slug: string): Promise<MakeHubResult> {
  if (!SLUG.test(slug)) return { status: "missing" };
  const res = await getJson(`/api/public/content/pages/${encodeURIComponent(slug)}`);
  if (!res) return { status: "unavailable" };
  if (res.status === 404) return { status: "missing" };
  const r = (res.json as { data?: unknown } | null)?.data as Record<string, unknown> | undefined;
  // The API serves any published page by slug, so the type is checked here: a guide or a model page must never render as a make hub.
  if (!r || typeof r !== "object" || str(r.page_type) !== "make_hub" || str(r.status) === "archived" || str(r.body_html).trim() === "") return { status: "missing" };
  const make = str(r.make) || slug;
  return {
    status: "ok",
    hub: {
      slug, make, h1: str(r.h1) || `Used ${make} Vans For Sale`, metaTitle: str(r.meta_title), metaDescription: str(r.meta_description),
      bodyHtml: sanitizeGuideHtml(str(r.body_html)), published: str(r.published_at), modified: str(r.updated_at) || str(r.published_at),
    },
  };
}

/** Slugs of the published make_hub pages. [] when the API is down (the sitemap then omits them). */
export async function getLiveMakeHubSlugs(): Promise<Set<string>> {
  const live = new Set<string>();
  for (let page = 1; page <= 10; page++) {
    const res = await getJson(`/api/public/content/pages?page_type=make_hub&page=${page}`);
    if (!res || res.status !== 200 || typeof res.json !== "object" || res.json === null) break;
    const body = res.json as { data?: unknown; last_page?: unknown };
    const rows = Array.isArray(body.data) ? body.data : [];
    for (const row of rows) {
      const slug = str((row as Record<string, unknown>)?.slug);
      if (SLUG.test(slug)) live.add(slug);
    }
    const last = typeof body.last_page === "number" ? body.last_page : 1;
    if (page >= last || rows.length === 0) break;
  }
  return live;
}
