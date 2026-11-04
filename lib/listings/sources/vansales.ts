import type { Listing, ListingImage } from "../types";
import { titleCase } from "../format";

/* =============================================================================
   PRIVATE SELLERS' ADVERTS — vansales-backend public feed
   GET {VANSALES_API_URL}/api/public/listings?seller_type=private   (list, paginated)
   GET {VANSALES_API_URL}/api/public/listings/{slug}                (detail)

   Only active adverts are ever returned (drafts and sold ones are invisible
   upstream) and the seller's name/email are never exposed: they appear as
   "Private seller". The photos are the CLEANED variant when the seller bought
   one (the API already prefers it). Unlike the dealer feeds this one has no
   location and no VAT. Buyers message the seller through
   components/private-enquiry-form.tsx (browser -> the API's /enquire); the dealer
   enquiry route (/api/enquiry) refuses these adverts.
   ========================================================================== */

const BASE = (process.env.VANSALES_API_URL || process.env.NEXT_PUBLIC_VANSALES_API_URL || "https://api.vansales.com").replace(/\/$/, "");
const REVALIDATE = 60; // seconds: a new advert appears within a minute
const MAX_PAGES = 20; // 24 a page: a safety cap, not an expectation

/** Front-end slugs for these start with this, so they can never be mistaken for another source's trailing numeric id. */
export const PRIVATE_SLUG_PREFIX = "private-";
export const PRIVATE_ENQUIRY_REF_PREFIX = "vansales-private:";

interface ApiCard {
  id: number; title: string; slug: string; make: string; model: string; variant: string | null; year: number | null; mileage: number | null; price: number;
  fuel_type: string | null; transmission: string | null; body_type: string | null; colour: string | null; created_at: string; image: string | null; has_video?: boolean;
}
interface ApiDetail extends ApiCard {
  description: string | null; video_url: string | null; video_vertical_url: string | null;
  mot_expiry?: string | null; last_mot_mileage?: number | null; last_mot_date?: string | null; listing_images: Array<{ url: string; original_url: string; is_cleaned: boolean; sort_order: number }>;
}

const or = (v: string | null | undefined, fallback: string) => (v && v.trim() !== "" ? titleCase(v.trim()) : fallback);

function toListing(c: ApiCard | ApiDetail): Listing {
  const detail = "listing_images" in c ? (c as ApiDetail) : null;
  const images: ListingImage[] = detail?.listing_images?.length
    ? detail.listing_images.map((i, n) => ({ url: i.url, alt: `${c.make} ${c.model} photo ${n + 1}${i.is_cleaned ? " (studio background)" : ""}` }))
    : c.image ? [{ url: c.image, alt: `${c.make} ${c.model}` }] : [];
  const year = c.year ?? 0;
  return {
    id: `vansales:${c.id}`,
    source: "vansales",
    source_id: String(c.id),
    tenant_id: 0,
    seller_type: "private",
    slug: `${PRIVATE_SLUG_PREFIX}${c.slug}`,
    status: "active",
    make: c.make,
    model: c.model,
    derivative: c.variant ?? "",
    condition: "used",
    year,
    plate: year ? String(year).slice(-2) : "",
    price: c.price > 0 ? c.price : null,
    price_type: "inc_vat",
    vat_qualifying: false,
    mileage: c.mileage,
    fuel: or(c.fuel_type, "—"),
    transmission: or(c.transmission, "—"),
    drivetrain: "—",
    colour: or(c.colour, "—"),
    engine_cc: null,
    euro_status: null,
    ulez: false,
    van_spec: { body_style: or(c.body_type, "Van"), wheelbase: null, roof_height: null, payload_kg: null, load_length_mm: null, doors: null },
    location: { town: "UK", region: "", postcode_area: "", lat: null, lng: null },
    description: detail?.description ?? "",
    features: [],
    images,
    seller: { name: "Private seller", type: "private", logo: null, rating: null },
    // Enquiries for these adverts go to the vansales API (private-enquiry-form.tsx), never to a dealer's inbox: /api/enquiry refuses this ref.
    enquiry_route: { to: "vansales_private", ref: `${PRIVATE_ENQUIRY_REF_PREFIX}${c.id}` },
    enquiry_url: null,
    stock_ref: null,
    video_url: detail?.video_url ?? null,
    video_vertical_url: detail?.video_vertical_url ?? null,
    mot_expiry: detail?.mot_expiry ?? null,
    last_mot_mileage: detail?.last_mot_mileage ?? null,
    last_mot_date: detail?.last_mot_date ?? null,
    published_at: c.created_at,
    updated_at: c.created_at,
  };
}

async function getJson<T>(path: string): Promise<T | null> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: "application/json" }, next: { revalidate: REVALIDATE, tags: ["vansales-private"] }, signal: AbortSignal.timeout(8_000) });
  return res.ok ? ((await res.json()) as T) : null;
}

/** Every active private advert (the catalogue is merged in memory, like the other sources). Failure is the caller's to swallow: the rest of the site must keep serving. */
export async function fetchPrivateSellerListings(): Promise<Listing[]> {
  const out: Listing[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const body = await getJson<{ data: ApiCard[]; last_page: number }>(`/api/public/listings?seller_type=private&page=${page}`);
    if (!body) break;
    out.push(...body.data.map(toListing));
    if (page >= body.last_page) break;
  }
  return out;
}

/** One private advert by its front-end slug ("private-<backend slug>"), with all its photos, video and description. Null if it is not (or no longer) active. */
export async function fetchPrivateSellerListingBySlug(slug: string): Promise<Listing | null> {
  if (!slug.startsWith(PRIVATE_SLUG_PREFIX)) return null;
  const backendSlug = slug.slice(PRIVATE_SLUG_PREFIX.length);
  if (!/^[a-z0-9-]{1,200}$/.test(backendSlug)) return null;
  const body = await getJson<{ data: ApiDetail & { seller_type?: string } }>(`/api/public/listings/${backendSlug}`);
  return body && body.data.seller_type === "private" ? toListing(body.data) : null;
}
