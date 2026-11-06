/**
 * Van News: articles written by vansales-backend's Van News agent (Perplexity research, Claude writing), served at /van-news/{slug}.
 *   GET {VANSALES_API_URL}/api/public/van-news?make=&page=   {data:[{slug,title,make,model,article_type,meta_description,published_at}], makes:[...], last_page}
 *   GET {VANSALES_API_URL}/api/public/van-news/{slug}        {data:{title,body,meta_title,meta_description,perplexity_sources,published_at,...}}  (404 = not published)
 * Read-only, server-side, cached 5 minutes. An outage never caches a 404: the article page errors instead ("unavailable"); the index, sitemap and make-page links fall back to nothing.
 */
import { getJson } from "@/lib/content/backend";
import { sanitizeGuideHtml } from "@/lib/content/sanitize";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const str = (v: unknown): string => (typeof v === "string" ? v : "");

export interface VanNewsSummary {
  slug: string;
  title: string;
  make: string;
  model: string;
  articleType: string;
  description: string;
  publishedAt: string;
}

export interface VanNewsArticle extends VanNewsSummary {
  metaTitle: string;
  /** Sanitised body HTML. */
  bodyHtml: string;
  sources: string[];
}

function summary(r: Record<string, unknown>): VanNewsSummary | null {
  const slug = str(r.slug);
  if (!SLUG.test(slug)) return null;
  return { slug, title: str(r.title) || slug, make: str(r.make), model: str(r.model), articleType: str(r.article_type), description: str(r.meta_description), publishedAt: str(r.published_at) };
}

/** The newest published articles (all pages up to a cap), newest first, optionally one make. [] when the API is down. */
export async function getVanNewsArticles(make?: string): Promise<VanNewsSummary[]> {
  const out: VanNewsSummary[] = [];
  for (let page = 1; page <= 10; page++) {
    const res = await getJson(`/api/public/van-news?page=${page}${make ? `&make=${encodeURIComponent(make)}` : ""}`);
    if (!res || res.status !== 200 || typeof res.json !== "object" || res.json === null) break;
    const body = res.json as { data?: unknown; last_page?: unknown };
    const rows = Array.isArray(body.data) ? body.data : [];
    for (const row of rows) {
      const s = summary(row as Record<string, unknown>);
      if (s) out.push(s);
    }
    if (page >= (typeof body.last_page === "number" ? body.last_page : 1) || rows.length === 0) break;
  }
  return out;
}

/** Every make that has a published article, for the filter chips. [] when the API is down. */
export async function getVanNewsMakes(): Promise<string[]> {
  const res = await getJson("/api/public/van-news?page=1");
  const makes = res && res.status === 200 ? (res.json as { makes?: unknown } | null)?.makes : null;
  return Array.isArray(makes) ? makes.filter((m): m is string => typeof m === "string" && m !== "") : [];
}

export type VanNewsResult = { status: "ok"; article: VanNewsArticle } | { status: "missing" } | { status: "unavailable" };

export async function getVanNewsArticle(slug: string): Promise<VanNewsResult> {
  if (!SLUG.test(slug)) return { status: "missing" };
  const res = await getJson(`/api/public/van-news/${encodeURIComponent(slug)}`);
  if (!res) return { status: "unavailable" };
  if (res.status === 404) return { status: "missing" };
  const r = (res.json as { data?: unknown } | null)?.data as Record<string, unknown> | undefined;
  const s = r && typeof r === "object" ? summary({ ...r, slug }) : null;
  if (!r || !s || str(r.body).trim() === "") return { status: "missing" };
  const sources = (Array.isArray(r.perplexity_sources) ? r.perplexity_sources : []).filter((u): u is string => typeof u === "string" && /^https:\/\//.test(u)).slice(0, 8);
  return { status: "ok", article: { ...s, metaTitle: str(r.meta_title) || s.title, bodyHtml: sanitizeGuideHtml(str(r.body)), sources } };
}
