import type { Listing } from "@/lib/listings/types";
import { dealerAdvertCardToListing } from "@/lib/listings/sources/vansales";
import { apiHeaders } from "@/lib/api-headers";

/* =============================================================================
   DEALERS FROM THE VANSALES API (dealer portal)
   GET {VANSALES_API_URL}/api/public/dealers/{slug}   the public profile + newest adverts (404 = no such ACTIVE dealer)
   GET {VANSALES_API_URL}/api/public/dealers?page=N   active dealers, 24 a page: {data:[{name,slug,town,county,logo_url,stock_count}], last_page}
   Short revalidate, hard timeout. Every function reports a failure as { kind: "error" } rather than throwing, so a slow API never takes a page down;
   only an explicit 404 is "not found".
   ========================================================================== */

const BASE = (process.env.VANSALES_API_URL || process.env.NEXT_PUBLIC_VANSALES_API_URL || "https://api.vansales.com").replace(/\/$/, "");
const REVALIDATE = 120;
const TIMEOUT_MS = 6_000;
const MAX_DIRECTORY_PAGES = 5; // 24 a page: 120 dealers, a safety cap

export type DayHours = { open: string; close: string } | null;
export type OpeningHours = Partial<Record<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun", DayHours>>;

export interface ApiDealer {
  name: string;
  /** The name shown: Title Case without Limited/Ltd, or the dealer's own override. Absent on an older API. */
  display_name?: string | null;
  companies_house_number?: string | null;
  incorporation_year?: number | null;
  trading_since?: number | null;
  slug: string;
  town: string | null;
  county: string | null;
  postcode: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  logo_url: string | null;
  /** Wide banner photo for the profile header. Optional: absent/null until the dealer uploads one. */
  cover_url?: string | null;
  about: string | null;
  /** Never a number (gated contact): whether the dealer has WhatsApp / a phone. The dealer's own public `phone` above stays. */
  has_whatsapp?: boolean;
  has_phone?: boolean;
  finance_url: string | null;
  website_url: string | null;
  social: Partial<Record<"facebook" | "instagram" | "linkedin" | "youtube" | "twitter", string | null>>;
  google_reviews_url: string | null;
  opening_hours: OpeningHours | null;
  stock_count: number;
  /** Optional extras (dealer portal profile additions); absent on an older API. */
  what3words?: string | null;
  google_maps_url?: string | null;
  specialisms?: string[];
  photos?: { url: string }[];
  google_rating?: number | null;
  google_review_count?: number | null;
  google_reviews?: { author: string; rating: number; text: string; time: string | null }[];
  /** Whether the dealer shows the "Value your van" part-exchange card (default false; true for Swiss Vans). Absent on an older API. */
  px_enabled?: boolean;
}

export interface ApiDealerSummary {
  name: string;
  display_name?: string | null;
  slug: string;
  town: string | null;
  county: string | null;
  logo_url: string | null;
  stock_count: number;
  latitude?: number | null;
  longitude?: number | null;
  /** Whether the dealer has an about text (written by them or generated). Absent on an older API. */
  has_about?: boolean;
}

export type DealerProfileResult =
  | { kind: "ok"; dealer: ApiDealer; listings: Listing[] }
  | { kind: "notfound" }
  | { kind: "error" };

const SLUG = /^[a-z0-9][a-z0-9-]{0,120}$/;

async function get(path: string): Promise<Response> {
  return fetch(`${BASE}${path}`, { headers: apiHeaders(), next: { revalidate: REVALIDATE, tags: ["vansales-dealers"] }, signal: AbortSignal.timeout(TIMEOUT_MS) });
}

export async function fetchApiDealerProfile(slug: string): Promise<DealerProfileResult> {
  if (!SLUG.test(slug)) return { kind: "notfound" };
  try {
    const res = await get(`/api/public/dealers/${slug}`);
    if (res.status === 404) return { kind: "notfound" };
    if (!res.ok) return { kind: "error" };
    const body = (await res.json()) as { dealer?: ApiDealer; listings?: { data?: unknown[] } };
    if (!body.dealer || typeof body.dealer.slug !== "string") return { kind: "error" };
    const listings = (body.listings?.data ?? []).map(dealerAdvertCardToListing).filter((l): l is Listing => l !== null);
    return { kind: "ok", dealer: body.dealer, listings };
  } catch (e) {
    console.warn(`[dealers] profile ${slug} failed: ${(e as Error).message}`);
    return { kind: "error" };
  }
}

/** Active dealers from the API, bounded and fail-safe: any failure returns what was read so far (possibly nothing). */
export async function fetchApiDealers(): Promise<ApiDealerSummary[]> {
  const out: ApiDealerSummary[] = [];
  try {
    for (let page = 1; page <= MAX_DIRECTORY_PAGES; page++) {
      const res = await get(`/api/public/dealers?page=${page}`);
      if (!res.ok) break;
      const body = (await res.json()) as { data?: ApiDealerSummary[]; last_page?: number };
      for (const d of body.data ?? []) if (d && typeof d.slug === "string" && SLUG.test(d.slug) && typeof d.name === "string") out.push(d);
      if (page >= (body.last_page ?? 1)) break;
    }
  } catch (e) {
    console.warn(`[dealers] directory failed: ${(e as Error).message}`);
  }
  return out;
}
