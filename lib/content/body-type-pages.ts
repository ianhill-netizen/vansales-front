/**
 * The copy behind /used-vans/body-type/{slug}: vansales-backend body_type_pages rows (H1, meta, a ~600-word Gemini buying guide, a hero and one in-context picture).
 *   GET {VANSALES_API_URL}/api/public/body-type-pages          the published pages (slug list, for the sitemap and the index links)
 *   GET {VANSALES_API_URL}/api/public/body-type-pages/{slug}   one published page: {data:{h1,meta_title,meta_description,blurb_html,hero_image_url,images:[{key,role,url,alt}],...}}  (404 = not published)
 * Read-only, server-side, cached 5 minutes. Same rule as the model pages: an API outage must never cache a 404, so a page that cannot be fetched is "unavailable" and the render errors (ISR keeps the last good page).
 */
import { getJson } from "@/lib/content/backend";
import { safeImageUrl, sanitizeGuideHtml } from "@/lib/content/sanitize";
import { BODY_TYPE_PAGES } from "@/lib/used-vans/body-types";

const str = (v: unknown): string => (typeof v === "string" ? v : "");

export interface BodyTypePage {
  slug: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  /** Sanitised paragraphs. */
  blurbHtml: string;
  heroUrl: string | null;
  heroAlt: string;
  /** The in-context picture (key b1). */
  contextUrl: string | null;
  contextAlt: string;
  updatedAt: string;
}

export type BodyTypePageResult = { status: "ok"; page: BodyTypePage } | { status: "missing" } | { status: "unavailable" };

export async function getBodyTypePage(slug: string): Promise<BodyTypePageResult> {
  if (!BODY_TYPE_PAGES.some((b) => b.slug === slug)) return { status: "missing" };
  const res = await getJson(`/api/public/body-type-pages/${encodeURIComponent(slug)}`);
  if (!res) return { status: "unavailable" };
  if (res.status === 404) return { status: "missing" };
  const r = (res.json as { data?: unknown } | null)?.data as Record<string, unknown> | undefined;
  if (!r || typeof r !== "object" || str(r.blurb_html).trim() === "") return { status: "missing" };
  const imgs = (Array.isArray(r.images) ? r.images : []) as Array<Record<string, unknown>>;
  const pic = (key: string) => {
    const i = imgs.find((x) => str(x?.key) === key);
    const url = i ? safeImageUrl(str(i.url)) : null;
    return { url, alt: i ? str(i.alt) : "" };
  };
  const hero = pic("hero");
  const ctx = pic("b1");
  return {
    status: "ok",
    page: {
      slug,
      h1: str(r.h1),
      metaTitle: str(r.meta_title),
      metaDescription: str(r.meta_description),
      blurbHtml: sanitizeGuideHtml(str(r.blurb_html)),
      heroUrl: safeImageUrl(str(r.hero_image_url)) ?? hero.url,
      heroAlt: hero.alt,
      contextUrl: ctx.url,
      contextAlt: ctx.alt,
      updatedAt: str(r.updated_at) || str(r.published_at),
    },
  };
}

/** Slugs of the published body-type pages that are also in the allowlist. [] when the API is down (the sitemap and index links then simply omit them). */
export async function getLiveBodyTypeSlugs(): Promise<Set<string>> {
  const res = await getJson("/api/public/body-type-pages");
  const rows = res && res.status === 200 ? ((res.json as { data?: unknown } | null)?.data ?? []) : [];
  const allowed = new Set(BODY_TYPE_PAGES.map((b) => b.slug));
  const live = new Set<string>();
  for (const row of Array.isArray(rows) ? rows : []) {
    const slug = str((row as Record<string, unknown>)?.slug);
    if (allowed.has(slug)) live.add(slug);
  }
  return live;
}

/** slug -> updated_at (falling back to published_at) of the published body-type pages, for the sitemap's lastmod. Same list URL as getLiveBodyTypeSlugs, so the read is shared. Empty when the API is down. */
export async function getBodyTypeDates(): Promise<Map<string, string>> {
  const res = await getJson("/api/public/body-type-pages");
  const rows = res && res.status === 200 ? ((res.json as { data?: unknown } | null)?.data ?? []) : [];
  const out = new Map<string, string>();
  for (const row of Array.isArray(rows) ? rows : []) {
    const r = row as Record<string, unknown>;
    const d = str(r?.updated_at) || str(r?.published_at);
    if (str(r?.slug) && d) out.set(str(r.slug), d);
  }
  return out;
}
