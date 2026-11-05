/**
 * The editorial pages behind /used-vans/{make}/{model}: vansales-backend content_pages rows of page_type make_model (written by the content agent, pictures added by content:model-images).
 *   GET {VANSALES_API_URL}/api/public/content/pages/{slug}                  one published page: {data:{h1,meta_title,meta_description,body_html,hero_image_url,images:[{key,role,url,alt,section}],make,model,...}}
 *   GET {VANSALES_API_URL}/api/public/content/pages?page_type=make_model    the list (slugs), for the sitemap
 * Read-only, server-side, cached 5 minutes. An API outage must never break the site: the sitemap falls back to nothing and a page that cannot be fetched is "unavailable" (the page errors) rather than a cached 404.
 */
import { bodyWithImages, getJson, type BackendGuide, type BackendImage } from "@/lib/content/backend";
import { safeImageUrl, sanitizeGuideHtml } from "@/lib/content/sanitize";
import { USED_VAN_MODELS } from "@/lib/used-vans/models";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const str = (v: unknown): string => (typeof v === "string" ? v : "");

export interface ModelPage {
  slug: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  /** Sanitised body with the body pictures placed. */
  bodyHtml: string;
  heroUrl: string | null;
  heroAlt: string;
  imageCount: number;
  updatedAt: string;
}

export type ModelPageResult = { status: "ok"; page: ModelPage } | { status: "missing" } | { status: "unavailable" };

export async function getModelPage(slug: string): Promise<ModelPageResult> {
  if (!SLUG.test(slug)) return { status: "missing" };
  const res = await getJson(`/api/public/content/pages/${encodeURIComponent(slug)}`);
  if (!res) return { status: "unavailable" };
  if (res.status === 404) return { status: "missing" };
  const row = (res.json as { data?: unknown } | null)?.data;
  if (!row || typeof row !== "object") return { status: "missing" };
  const r = row as Record<string, unknown>;
  if (str(r.page_type) !== "make_model" || str(r.status) === "archived" || str(r.body_html).trim() === "") return { status: "missing" };
  const images: BackendImage[] = [];
  for (const i of Array.isArray(r.images) ? r.images : []) {
    const o = i as Record<string, unknown>;
    const url = safeImageUrl(str(o?.url));
    if (url) images.push({ role: str(o.role) === "hero" ? "hero" : "body", url, alt: str(o.alt), caption: str(o.caption) || null, section: str(o.section) || null });
  }
  const heroUrl = safeImageUrl(str(r.hero_image_url)) ?? images.find((i) => i.role === "hero")?.url ?? null;
  const asGuide: BackendGuide = {
    slug, title: str(r.title) || slug, description: str(r.meta_description), date: str(r.published_at), pageType: "make_model", h1: str(r.h1), metaTitle: str(r.meta_title),
    bodyHtml: sanitizeGuideHtml(str(r.body_html)), heroUrl, images,
  };
  return {
    status: "ok",
    page: {
      slug, h1: asGuide.h1, metaTitle: asGuide.metaTitle || asGuide.title, metaDescription: asGuide.description, bodyHtml: bodyWithImages(asGuide), heroUrl,
      heroAlt: images.find((i) => i.url === heroUrl)?.alt || "", imageCount: images.length, updatedAt: str(r.updated_at) || str(r.published_at),
    },
  };
}

/** Slugs of the published make_model pages that are also in the /used-vans allowlist. [] when the API is down. */
export async function getLiveModelPageSlugs(): Promise<Set<string>> {
  const allowed = new Set(USED_VAN_MODELS.map((m) => m.pageSlug));
  const live = new Set<string>();
  for (let page = 1; page <= 10; page++) {
    const res = await getJson(`/api/public/content/pages?page_type=make_model&page=${page}`);
    if (!res || res.status !== 200 || typeof res.json !== "object" || res.json === null) break;
    const body = res.json as { data?: unknown; last_page?: unknown };
    const rows = Array.isArray(body.data) ? body.data : [];
    for (const row of rows) {
      const slug = str((row as Record<string, unknown>)?.slug);
      if (allowed.has(slug)) live.add(slug);
    }
    const last = typeof body.last_page === "number" ? body.last_page : 1;
    if (page >= last || rows.length === 0) break;
  }
  return live;
}
