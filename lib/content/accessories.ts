/** The copy behind /van-accessories: a vansales-backend content_pages row each (see lib/accessories.ts). Read-only, server-side; an outage errors the render (ISR keeps the last good page), a missing row is a 404. */
import { getJson } from "@/lib/content/backend";
import { sanitizeGuideHtml } from "@/lib/content/sanitize";
import { parseFaq } from "@/lib/content/faq";

const str = (v: unknown): string => (typeof v === "string" ? v : "");

export type AccessoryBody = { status: "ok"; bodyHtml: string; faq: { q: string; a: string }[]; published: string; modified: string } | { status: "missing" } | { status: "unavailable" };

/** Backend slugs of the accessory rows that are published (hub + topics). [] when the API is down (the sitemap then omits them). */
export async function getLiveAccessorySlugs(slugs: readonly string[]): Promise<Set<string>> {
  const live = new Set<string>();
  await Promise.all(slugs.map(async (s) => {
    const r = await getAccessoryBody(s).catch(() => ({ status: "unavailable" as const }));
    if (r.status === "ok") live.add(s);
  }));
  return live;
}

export async function getAccessoryBody(backendSlug: string): Promise<AccessoryBody> {
  const res = await getJson(`/api/public/content/pages/${encodeURIComponent(backendSlug)}`);
  if (!res) return { status: "unavailable" };
  if (res.status === 404) return { status: "missing" };
  const r = (res.json as { data?: unknown } | null)?.data as Record<string, unknown> | undefined;
  if (!r || typeof r !== "object" || str(r.body_html).trim() === "") return { status: "missing" };
  const bodyHtml = sanitizeGuideHtml(str(r.body_html));
  return { status: "ok", bodyHtml, faq: parseFaq(bodyHtml), published: str(r.published_at), modified: str(r.updated_at) || str(r.published_at) };
}
