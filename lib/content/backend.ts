/**
 * Guides that vansales-backend stores in content_pages (Mason publishes them through its POST /api/internal/pages/create). Read-only, server-side.
 *   GET {VANSALES_API_URL}/api/public/content/pages            paginated list {data:[{slug,title,meta_title,meta_description,page_type,published_at,word_count,...}], last_page}
 *   GET {VANSALES_API_URL}/api/public/content/pages/{slug}     {data:{...,h1,body_html,hero_image_url,images:[{role,url,alt,caption,section}]}}  (404 = no such PUBLISHED page)
 * Only page_type 'guide' is rendered (make_model and body_type pages belong to the /vans/* routes). Cached 5 minutes. An outage of the API must never break the blog: the list and the sitemap quietly fall back to the local posts, and a guide page that cannot be fetched throws (an uncached error) rather
 * than caching a 404 for a page that exists.
 */
import { escapeHtml, safeImageUrl, sanitizeGuideHtml } from "@/lib/content/sanitize";
import { LANDING_BACKEND_SLUGS } from "@/lib/landing-pages";
import { apiHeaders } from "@/lib/api-headers";
import { retryDelayMs } from "@/lib/content/retry";

const BASE = (process.env.VANSALES_API_URL || process.env.NEXT_PUBLIC_VANSALES_API_URL || "https://api.vansales.com").replace(/\/$/, "");
const REVALIDATE = 300;
const TIMEOUT_MS = 6000;
const MAX_LIST_PAGES = 10;

export interface BackendGuideSummary {
  slug: string;
  title: string;
  description: string;
  date: string;
  pageType: string;
}

export interface BackendImage {
  role: string;
  url: string;
  alt: string;
  caption: string | null;
  section: string | null;
}

export interface BackendGuide extends BackendGuideSummary {
  h1: string;
  metaTitle: string;
  bodyHtml: string;
  heroUrl: string | null;
  images: BackendImage[];
}

export type GuideResult = { status: "ok"; guide: BackendGuide } | { status: "missing" } | { status: "unavailable" };

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// The backend counts public reads per IP (120 a minute) and every server render from Vercel shares a few IPs, so a crawl burst (Googlebot, or our own audit) gets 429 from the API. A page that throws on that is a 500 to the crawler, which slows its crawl of the whole site.
// So: retry a throttled or failing read (honouring Retry-After, bounded), and when it still fails serve the last good answer for that path from this instance (stale-if-error) instead of failing.
const RETRY_STATUSES = new Set([429, 502, 503, 504]);
const MAX_ATTEMPTS = 3;
const STALE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const lastGood = new Map<string, { at: number; value: { status: number; json: unknown } }>();

export async function getJson(path: string): Promise<{ status: number; json: unknown } | null> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let wait = 0;
    try {
      const res = await fetch(`${BASE}${path}`, { headers: apiHeaders(), next: { revalidate: REVALIDATE }, signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (res.status === 404) return { status: 404, json: null };
      if (res.ok) {
        const value = { status: res.status, json: await res.json() };
        lastGood.set(path, { at: Date.now(), value });
        return value;
      }
      if (!RETRY_STATUSES.has(res.status)) break; // a 4xx/500 that will not change on retry
      wait = retryDelayMs(attempt, res.headers.get("retry-after"));
    } catch {
      wait = retryDelayMs(attempt, null); // timeout or network error
    }
    if (attempt < MAX_ATTEMPTS) await new Promise((r) => setTimeout(r, wait));
  }
  const stale = lastGood.get(path);
  return stale && Date.now() - stale.at < STALE_MAX_AGE_MS ? stale.value : null;
}

const str = (v: unknown): string => (typeof v === "string" ? v : "");

function summary(r: Record<string, unknown>): BackendGuideSummary | null {
  const slug = str(r.slug);
  if (!SLUG.test(slug)) return null;
  const title = str(r.title) || slug;
  return { slug, title, description: str(r.meta_description), date: str(r.published_at), pageType: str(r.page_type) };
}

/** Every published guide, newest first as the API returns them. [] when the API is down or has none. */
export async function getBackendGuides(): Promise<BackendGuideSummary[]> {
  const out: BackendGuideSummary[] = [];
  const seen = new Set<string>();
  for (let page = 1; page <= MAX_LIST_PAGES; page++) {
    const res = await getJson(`/api/public/content/pages?page=${page}`);
    if (!res || res.status !== 200 || typeof res.json !== "object" || res.json === null) break;
    const body = res.json as { data?: unknown; last_page?: unknown };
    const rows = Array.isArray(body.data) ? body.data : [];
    for (const row of rows) {
      const s = row && typeof row === "object" ? summary(row as Record<string, unknown>) : null;
      // only articles: make/model and body-type pages in content_pages belong to the /vans/* routes, not to /blog
      if (s && s.pageType === "guide" && !LANDING_BACKEND_SLUGS.has(s.slug) && !seen.has(s.slug)) {
        seen.add(s.slug);
        out.push(s);
      }
    }
    const last = typeof body.last_page === "number" ? body.last_page : 1;
    if (page >= last || rows.length === 0) break;
  }
  return out;
}

export async function getBackendGuide(slug: string): Promise<GuideResult> {
  if (!SLUG.test(slug)) return { status: "missing" };
  const res = await getJson(`/api/public/content/pages/${encodeURIComponent(slug)}`);
  if (!res) return { status: "unavailable" };
  if (res.status === 404) return { status: "missing" };
  const row = (res.json as { data?: unknown } | null)?.data;
  if (!row || typeof row !== "object") return { status: "missing" };
  const r = row as Record<string, unknown>;
  const s = summary(r);
  if (!s || s.pageType !== "guide" || str(r.status) === "archived" || str(r.body_html).trim() === "") return { status: "missing" };
  const images: BackendImage[] = [];
  for (const i of Array.isArray(r.images) ? r.images : []) {
    const o = i as Record<string, unknown>;
    const url = safeImageUrl(str(o?.url));
    if (url) images.push({ role: str(o.role) === "hero" ? "hero" : "body", url, alt: str(o.alt), caption: str(o.caption) || null, section: str(o.section) || null });
  }
  const hero = safeImageUrl(str(r.hero_image_url)) ?? images.find((i) => i.role === "hero")?.url ?? null;
  return { status: "ok", guide: { ...s, h1: str(r.h1) || s.title, metaTitle: str(r.meta_title) || s.title, bodyHtml: sanitizeGuideHtml(str(r.body_html)), heroUrl: hero, images } };
}

/** slug -> published_at for every published content page of every type (make_model, make_hub, landing, guide ...). Same list URL as getBackendGuides, so the read is shared. Empty when the API is down. */
export async function getContentPublishedDates(): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  for (let page = 1; page <= MAX_LIST_PAGES; page++) {
    const res = await getJson(`/api/public/content/pages?page=${page}`);
    if (!res || res.status !== 200 || typeof res.json !== "object" || res.json === null) break;
    const body = res.json as { data?: unknown; last_page?: unknown };
    const rows = Array.isArray(body.data) ? body.data : [];
    for (const row of rows) {
      const r = row as Record<string, unknown>;
      if (SLUG.test(str(r?.slug)) && str(r.published_at)) out.set(str(r.slug), str(r.published_at));
    }
    if (page >= (typeof body.last_page === "number" ? body.last_page : 1) || rows.length === 0) break;
  }
  return out;
}

const norm = (s: string) => s.toLowerCase().replace(/<[^>]*>/g, "").replace(/&[a-z#0-9]+;/g, " ").replace(/[^a-z0-9]+/g, " ").trim();

/**
 * The guide body with its body pictures in place: a picture with a `section` goes after the first paragraph that follows the heading of that name; the rest are appended. All values are escaped and the
 * URL must be https. The hero is rendered by the page, not here.
 */
export function bodyWithImages(guide: BackendGuide): string {
  const pics = guide.images.filter((i) => i.role !== "hero" && i.url !== guide.heroUrl);
  let html = guide.bodyHtml;
  const figure = (i: BackendImage) =>
    `<figure class="my-6"><img src="${escapeHtml(i.url)}" alt="${escapeHtml(i.alt)}" loading="lazy" decoding="async" class="w-full rounded-lg" />${i.caption ? `<figcaption class="mt-2 text-sm text-ink-500">${escapeHtml(i.caption)}</figcaption>` : ""}</figure>`;
  const rest: BackendImage[] = [];
  for (const p of pics) {
    let placed = false;
    if (p.section) {
      const want = norm(p.section);
      const re = /<h([234])>([\s\S]*?)<\/h\1>/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(html)) !== null) {
        if (norm(m[2]) !== want) continue;
        const after = m.index + m[0].length;
        const close = html.indexOf("</p>", after);
        const at = close === -1 ? after : close + 4;
        html = html.slice(0, at) + figure(p) + html.slice(at);
        placed = true;
        break;
      }
    }
    if (!placed) rest.push(p);
  }
  return html + rest.map(figure).join("");
}
