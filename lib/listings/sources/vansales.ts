import type { VanDetails } from "@/lib/listings/vanDetails";
import type { DealerContact, HpiCheckPublic, Listing, ListingImage } from "../types";
import { titleCase } from "../format";

/* =============================================================================
   PRIVATE SELLERS' ADVERTS — vansales-backend public feed
   GET {VANSALES_API_URL}/api/public/listings?seller_type=private   (list, paginated)
   GET {VANSALES_API_URL}/api/public/listings/{slug}                (detail)

   Only active adverts are ever returned (drafts and sold ones are invisible
   upstream) and the seller's name/email are never exposed: they appear as
   "Private seller". The photos are the CLEANED variant when the seller bought
   one (the API already prefers it). Unlike the dealer feeds this one has no
   location and no VAT.

   DEALER ADVERTS come from the same API (?seller_type=dealer): rows whose
   dealer block has has_call_booking === true. That is every advert in seller_listings,
   whether posted in the dealer portal or imported by vansales:sync-dealski (Swiss Vans
   included: the front no longer reads the Dealski feed). The same filter also returns
   any leftover legacy `listings` rows (has_call_booking false); those are dropped here. Dealer adverts
   get the "dealer-" slug prefix (agreed convention with the backend; note components/enquiry-modal.tsx posts slug "dealer-<tenant>" to /api/enquiry, so that route tells them apart by the trailing advert id), seller_type "dealer", the dealer's exact pin and a
   `dealer_contact` block; their enquiries and call requests go to the vansales API
   (components/listing-actions.tsx), never to /api/enquiry. Buyers message the seller through
   components/private-enquiry-form.tsx (browser -> the API's /enquire); the dealer
   enquiry route (/api/enquiry) refuses these adverts.
   ========================================================================== */

const BASE = (process.env.VANSALES_API_URL || process.env.NEXT_PUBLIC_VANSALES_API_URL || "https://api.vansales.com").replace(/\/$/, "");
const REVALIDATE = 60; // seconds: a new advert appears within a minute
const MAX_PAGES = 20; // 24 a page: a safety cap, not an expectation

/** Front-end slugs for these start with this, so they can never be mistaken for another source's trailing numeric id. */
export const PRIVATE_SLUG_PREFIX = "private-";
export const PRIVATE_ENQUIRY_REF_PREFIX = "vansales-private:";
export const DEALER_SLUG_PREFIX = "dealer-";
export const DEALER_ENQUIRY_REF_PREFIX = "vansales-dealer:";

interface ApiCard {
  id: number; title: string; slug: string; make: string; model: string; variant: string | null; year: number | null; mileage: number | null; price: number;
  fuel_type: string | null; transmission: string | null; body_type: string | null; colour: string | null; created_at: string; image: string | null; has_video?: boolean;
  /** The seller's geocoded postcode, when the API publishes it (town + coordinates only, never the postcode itself). */
  town?: string | null; latitude?: number | null; longitude?: number | null;
  /** List-card enrichment (the detail has the same fields). */
  seller_type?: "dealer" | "private";
  /** Present on dealer adverts (and legacy dealer stock); has_call_booking is true only for dealer portal adverts. */
  dealer?: { name: string; slug: string; logo_url?: string | null; town?: string | null; has_whatsapp?: boolean; has_phone?: boolean; finance_url?: string | null; has_call_booking?: boolean } | null;
  ulez_compliant?: boolean | null; vehicle_condition?: "excellent" | "good" | "fair" | "project" | null; v5_present?: boolean | null; vat_status?: "vat_qualifying" | "ex_vat" | "no_vat" | null; features?: { slug: string; label: string }[]; hpi_checked?: boolean;
}
interface ApiDetail extends ApiCard {
  description: string | null; video_url: string | null; video_vertical_url: string | null;
  mot_expiry?: string | null; last_mot_mileage?: number | null; last_mot_date?: string | null; vrm?: string | null; hpi_checked?: boolean; hpi_check?: HpiCheckPublic | null;
  seller_video_url?: string | null; vat_status?: "vat_qualifying" | "ex_vat" | "no_vat" | null; body_type_key?: string | null;
  wheelbase?: VanDetails["wheelbase"]; roof_height?: VanDetails["roof_height"]; rear_doors?: VanDetails["rear_doors"]; side_loading_door?: VanDetails["side_loading_door"];
  features?: { slug: string; label: string }[]; youtube_embed_url?: string | null; ulez_compliant?: boolean | null; condition?: "excellent" | "good" | "fair" | "project" | null;
  v5_present?: boolean | null; warranty_type?: "none" | "manufacturer" | "aftermarket" | null; warranty_expiry?: string | null; previous_owners?: number | null;
  seats?: number | null; payload_kg?: number | null; gross_weight_kg?: number | null; service_history?: VanDetails["service_history"]; engine_cc?: number | null; euro_class?: string | null; hpi_checked_at?: string | null; listing_images: Array<{ url: string; original_url: string; is_cleaned: boolean; sort_order: number }>;
}

const or = (v: string | null | undefined, fallback: string) => (v && v.trim() !== "" ? titleCase(v.trim()) : fallback);

/** A private seller's map pin is rounded to ~1 km: enough for "near X", never their street. */
const coarse = (v: number | null | undefined) => (typeof v === "number" && Number.isFinite(v) ? Math.round(v * 100) / 100 : null);

/** The dealer portal advert rows: the dealer block says has_call_booking. (Leftover legacy `listings` rows have it false and are dropped.) */
const isDealerAdvert = (c: ApiCard): boolean => c.seller_type === "dealer" && !!c.dealer && c.dealer.slug !== "" && c.dealer.has_call_booking === true;

/** A dealer's pin is their premises, so unlike a private seller's it is NOT coarsened. */
const exact = (v: number | null | undefined) => (typeof v === "number" && Number.isFinite(v) ? v : null);

function toListing(c: ApiCard | ApiDetail): Listing {
  const dealerAdvert = isDealerAdvert(c);
  const dealer = dealerAdvert ? c.dealer! : null;
  const dealer_contact: DealerContact | undefined = dealer
    ? {
        slug: dealer.slug, name: dealer.name, logo_url: dealer.logo_url ?? null, town: dealer.town ?? null,
        has_whatsapp: !!dealer.has_whatsapp, has_phone: !!dealer.has_phone,
        finance_url: dealer.finance_url || null,
        has_call_booking: true,
      }
    : undefined;
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
    seller_type: dealerAdvert ? "dealer" : "private",
    slug: `${dealerAdvert ? DEALER_SLUG_PREFIX : PRIVATE_SLUG_PREFIX}${c.slug}`,
    status: "active",
    make: c.make,
    model: c.model,
    derivative: c.variant ?? "",
    condition: "used",
    year,
    plate: year ? String(year).slice(-2) : "",
    price: c.price > 0 ? c.price : null,
    // The seller's VAT status drives the qualifier beside the price: "+ VAT" for VAT qualifying / ex-VAT, "No VAT" for no VAT. Not given = the old "inc. VAT" default.
    price_type: c.vat_status === "no_vat" ? "no_vat" : "inc_vat",
    vat_qualifying: c.vat_status === "vat_qualifying" || c.vat_status === "ex_vat",
    mileage: c.mileage,
    fuel: or(c.fuel_type, "—"),
    transmission: or(c.transmission, "—"),
    drivetrain: "—",
    colour: or(c.colour, "—"),
    engine_cc: detail?.engine_cc ?? null,
    euro_status: null,
    ulez: c.ulez_compliant === true,
    van_spec: { body_style: or(c.body_type, "Van"), wheelbase: detail?.wheelbase ?? null, roof_height: null, payload_kg: detail?.payload_kg ?? null, load_length_mm: null, doors: null },
    location: { town: c.town?.trim() || dealer?.town?.trim() || "UK", region: "", postcode_area: "", lat: dealerAdvert ? exact(c.latitude) : coarse(c.latitude), lng: dealerAdvert ? exact(c.longitude) : coarse(c.longitude) },
    description: detail?.description ?? "",
    features: [],
    images,
    seller: dealer ? { name: dealer.name, type: "dealer", logo: dealer.logo_url ?? null, rating: null } : { name: "Private seller", type: "private", logo: null, rating: null },
    dealer_contact,
    // Enquiries for these adverts go to the vansales API (private-enquiry-form.tsx), never to a Dealski inbox: /api/enquiry refuses these refs.
    enquiry_route: dealer ? { to: "vansales_dealer", ref: `${DEALER_ENQUIRY_REF_PREFIX}${c.id}` } : { to: "vansales_private", ref: `${PRIVATE_ENQUIRY_REF_PREFIX}${c.id}` },
    enquiry_url: null,
    stock_ref: null,
    vrm: detail?.vrm ?? null,
    // the API already puts the seller's own video in video_url when there is one; seller_video_url is kept explicit so the page can prefer it
    video_url: detail?.video_url ?? null,
    seller_video_url: detail?.seller_video_url ?? null,
    vat_status: c.vat_status ?? null,
    extras: c.features ?? [],
    youtube_embed_url: detail?.youtube_embed_url ?? null,
    ulez_compliant: c.ulez_compliant ?? null,
    vehicle_condition: c.vehicle_condition ?? detail?.condition ?? null,
    v5_present: c.v5_present ?? null,
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
    hpi_checked: c.hpi_checked === true,
    hpi_check: detail?.hpi_check ?? null,
    hpi_checked_at: detail?.hpi_checked_at ?? null,
    published_at: c.created_at,
    updated_at: c.created_at,
  };
}

async function getJson<T>(path: string, tags: string[] = ["vansales-private"]): Promise<T | null> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: "application/json" }, next: { revalidate: REVALIDATE, tags }, signal: AbortSignal.timeout(8_000) });
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

/** Any advert card from the vansales API (private or dealer portal) as a Listing: for the saved-vans page, which asks for cards by id. */
export function advertCardToListing(card: unknown): Listing | null {
  const c = card as ApiCard | null;
  return c && typeof c === "object" && typeof c.id === "number" ? toListing(c) : null;
}

/** A dealer portal advert card from a dealer profile or list response, as a Listing; null for anything else (leftover legacy rows, private adverts). */
export function dealerAdvertCardToListing(card: unknown): Listing | null {
  const c = card as ApiCard | null;
  return c && typeof c === "object" && isDealerAdvert(c) ? toListing(c) : null;
}

/** Every active dealer portal advert (leftover legacy rows in the same feed are skipped). Failure is the caller's to swallow. */
export async function fetchDealerPortalListings(): Promise<Listing[]> {
  const out: Listing[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const body = await getJson<{ data: ApiCard[]; last_page: number }>(`/api/public/listings?seller_type=dealer&page=${page}`, ["vansales-dealer"]);
    if (!body) break;
    for (const c of body.data) if (isDealerAdvert(c)) out.push(toListing(c));
    if (page >= body.last_page) break;
  }
  return out;
}

/** One dealer portal advert by its front-end slug ("dealer-<backend slug>"). Null if it is not (or no longer) active, or is a leftover legacy row. */
export async function fetchDealerPortalListingBySlug(slug: string): Promise<Listing | null> {
  if (!slug.startsWith(DEALER_SLUG_PREFIX)) return null;
  const backendSlug = slug.slice(DEALER_SLUG_PREFIX.length);
  if (!/^[a-z0-9-]{1,200}$/.test(backendSlug)) return null;
  const body = await getJson<{ data: ApiDetail }>(`/api/public/listings/${backendSlug}`, ["vansales-dealer"]);
  return body && isDealerAdvert(body.data) ? toListing(body.data) : null;
}
