/**
 * Affiliate links. The placements live in Dealski (Marketing > Affiliate): which Awin tracking link is placed on which page, and whether it is On. This site reads the ACTIVE ones for a page from
 *   GET {DEALSKI_API_URL}/api/public/affiliate-placements?tenant=swissvans&page=/van-insurance   (public, no auth, cached 5 minutes here)
 * so a link goes live, or comes down, from Dealski without a deploy. Nothing renders while there is no active placement, the API is unreachable or the answer is not an https awin1.com link: it fails closed.
 * Rendered by <AffiliateCta>: rel="sponsored nofollow noopener", a GA4 `affiliate_click` event and the visible commission line. No provider is named in code or copy.
 */
export interface Placement { advertiserId: number; href: string; label: string }

export const COMMISSION_LINE = "Vansales may earn a commission if you use this link. It does not change what this page says.";
export const DEFAULT_LABEL = "Visit our van insurance partner";

/** An https link on awin1.com: the only kind of tracking link a page will render. */
export function isAwinUrl(raw: unknown): raw is string {
  if (typeof raw !== "string") return false;
  try {
    const u = new URL(raw);
    return u.protocol === "https:" && (u.hostname === "www.awin1.com" || u.hostname === "awin1.com");
  } catch {
    return false;
  }
}

/** The API's {data:[{advertiser_id,label,tracking_url}]} as validated placements (anything else is dropped). Pure. */
export function parsePlacements(json: unknown): Placement[] {
  const rows = (json as { data?: unknown } | null)?.data;
  if (!Array.isArray(rows)) return [];
  const out: Placement[] = [];
  for (const r of rows as Array<Record<string, unknown>>) {
    if (!r || !isAwinUrl(r.tracking_url)) continue;
    const label = typeof r.label === "string" && r.label.trim() ? r.label.trim().slice(0, 60) : DEFAULT_LABEL;
    out.push({ advertiserId: Number(r.advertiser_id) || 0, href: new URL(r.tracking_url).toString(), label });
  }
  return out;
}
