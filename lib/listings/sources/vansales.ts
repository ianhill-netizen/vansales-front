import type { VanDetails } from "@/lib/listings/vanDetails";
import type { HpiResult, Listing, ListingImage } from "../types";
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
  /** The seller's geocoded postcode, when the API publishes it (town + coordinates only, never the postcode itself). */
  town?: string | null; latitude?: number | null; longitude?: number | null;
}
interface ApiDetail extends ApiCard {
  description: string | null; video_url: string | null; video_vertical_url: string | null;
  mot_expiry?: string | null; last_mot_mileage?: number | null; last_mot_date?: string | null; hpi_checked?: boolean; hpi_result?: HpiResult | null;
  seller_video_url?: string | null; vat_status?: "vat_qualifying" | "ex_vat" | "no_vat" | null; body_type_key?: string | null;
  wheelbase?: VanDetails["wheelbase"]; roof_height?: VanDetails["roof_height"]; rear_doors?: VanDetails["rear_doors"]; side_loading_door?: VanDetails["side_loading_door"];
  features?: { slug: string; label: string }[]; youtube_embed_url?: string | null; ulez_compliant?: boolean | null; condition?: "excellent" | "good" | "fair" | "project" | null;
  v5_present?: boolean | null; warranty_type?: "none" | "manufacturer" | "aftermarket" | null; warranty_expiry?: string | null; previous_owners?: number | null;
  seats?: number | null; payload_kg?: number | null; gross_weight_kg?: number | null; service_history?: VanDetails["service_history"]; engine_cc?: number | null; euro_class?: string | null; hpi_checked_at?: string | null; listing_images: Array<{ url: string; original_url: string; is_cleaned: boolean; sort_order: number }>;
}

const or = (v: string | null | undefined, fallback: string) => (v && v.trim() !== "" ? titleCase(v.trim()) : fallback);

/** A private seller's map pin is rounded to ~1 km: enough for "near X", never their street. */
const coarse = (v: number | null | undefined) => (typeof v === "number" && Number.isFinite(v) ? Math.round(v * 100) / 100 : null);

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
    // The seller's VAT status drives the qualifier beside the price: "+ VAT" for VAT qualifying / ex-VAT, "No VAT" for no VAT. Not given = the old "inc. VAT" default.
    price_type: detail?.vat_status === "no_vat" ? "no_vat" : "inc_vat",
    vat_qualifying: detail?.vat_status === "vat_qualifying" || detail?.vat_status === "ex_vat",
    mileage: c.mileage,
    fuel: or(c.fuel_type, "—"),
    transmission: or(c.transmission, "—"),
    drivetrain: "—",
    colour: or(c.colour, "—"),
    engine_cc: detail?.engine_cc ?? null,
    euro_status: null,
    ulez: detail?.ulez_compliant === true,
    van_spec: { body_style: or(c.body_type, "Van"), wheelbase: detail?.wheelbase ?? null, roof_height: null, payload_kg: detail?.payload_kg ?? null, load_length_mm: null, doors: null },
    location: { town: c.town?.trim() || "UK", region: "", postcode_area: "", lat: coarse(c.latitude), lng: coarse(c.longitude) },
    description: detail?.description ?? "",
    features: [],
    images,
    seller: { name: "Private seller", type: "private", logo: null, rating: null },
    // Enquiries for these adverts go to the vansales API (private-enquiry-form.tsx), never to a dealer's inbox: /api/enquiry refuses this ref.
    enquiry_route: { to: "vansales_private", ref: `${PRIVATE_ENQUIRY_REF_PREFIX}${c.id}` },
    enquiry_url: null,
    stock_ref: null,
    // the API already puts the seller's own video in video_url when there is one; seller_video_url is kept explicit so the page can prefer it
    video_url: detail?.video_url ?? null,
    seller_video_url: detail?.seller_video_url ?? null,
    vat_status: detail?.vat_status ?? null,
    extras: detail?.features ?? [],
    youtube_embed_url: detail?.youtube_embed_url ?? null,
    ulez_compliant: detail?.ulez_compliant ?? (c as ApiCard & { ulez_compliant?: boolean | null }).ulez_compliant ?? null,
    vehicle_condition: detail?.condition ?? null,
    v5_present: detail?.v5_present ?? null,
    warranty_type: detail?.warranty_type ?? null,
    warranty_expiry: detail?.warranty_expiry ?? null,
    details: detail ? {
      body_type: detail.body_type_key ? c.body_type : null, wheelbase: detail.wheelbase ?? null, roof_height: detail.roof_height ?? null, rear_doors: detail.rear_doors ?? null, side_loading_door: detail.side_loading_door ?? null,
      seats: detail.seats ?? null, payload_kg: detail.payload_kg ?? null, gross_weight_kg: detail.gross_weight_kg ?? null, service_history: detail.service_history ?? null, engine_cc: detail.engine_cc ?? null, euro_class: detail.euro_class ?? null, previous_owners: detail.previous_owners ?? null,
    } : undefined,
    video_vertical_url: detail?.video_vertical_url ?? null,
    mot_expiry: detail?.mot_expiry ?? null,
    last_mot_mileage: detail?.last_mot_mileage ?? null,
    last_mot_date: detail?.last_mot_date ?? null,
    hpi_checked: detail?.hpi_checked === true,
    hpi_result: detail?.hpi_result ?? null,
    hpi_checked_at: detail?.hpi_checked_at ?? null,
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
