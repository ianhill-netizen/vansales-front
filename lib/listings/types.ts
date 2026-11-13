/* =============================================================================
   CANONICAL CONTRACT
   The single shape every screen renders. Every source (live Dealski feed,
   native listings, mock fixtures) maps INTO this. Nothing downstream of a
   source adapter should know which source it came from.
   ========================================================================== */

export type ListingSource = "dealski" | "native" | "vansales";
export type SellerType = "dealer" | "private";
export type ListingStatus = "active" | "reserved" | "sold" | "removed";
export type Condition = "used" | "new";
/** inc_vat = price includes VAT; ex_vat = "+ VAT"; no_vat; unknown = the record does not say (shown with NO qualifier). */
export type PriceType = "inc_vat" | "ex_vat" | "no_vat" | "unknown";
export type Wheelbase = "swb" | "mwb" | "lwb" | "xlwb";
export type RoofHeight = "low" | "medium" | "high";

export interface VanSpec {
  body_style: string; // e.g. "Panel Van", "Dropside", "Luton", "Crew Cab"
  wheelbase: Wheelbase | null;
  roof_height: RoofHeight | null;
  payload_kg: number | null;
  load_length_mm: number | null;
  doors: number | null;
}

export interface ListingLocation {
  town: string;
  region: string;
  postcode_area: string; // e.g. "CF", "M", "BS"
  lat: number | null;
  lng: number | null;
}

export interface ListingImage {
  url: string; // may be a real URL or a synthetic "van://" descriptor for the SVG renderer
  alt: string;
}

export interface Seller {
  name: string;
  type: SellerType;
  logo: string | null;
  rating: number | null; // 0–5
}

export interface EnquiryRoute {
  to: string; // e.g. "dealski_tenant", "native_inbox"
  ref: string; // opaque reference passed back to the source on enquiry
}

/** The public HPI findings (vansales API `hpi_check`). Each flag: true = a problem was found, false = checked and clear, null = NOT checked. */
export interface HpiCheckPublic {
  stolen: boolean | null;
  finance: boolean | null;
  written_off: boolean | null;
  mileage_discrepancy: boolean | null;
  plate_changes: boolean | null;
  previous_keepers: number | null;
  checked_at: string | null;
  clear: boolean;
}

/** A vansales-API dealer's contact options on one of their adverts (dealer portal adverts only). Each optional field is absent unless the dealer set it up. */
export interface DealerContact {
  slug: string;
  name: string;
  logo_url: string | null;
  town: string | null;
  /** Whether the dealer has WhatsApp / a phone. The NUMBERS are never in a listing: they are only given out by POST /api/public/listings/{id}/lead, after the buyer has been logged. */
  has_whatsapp?: boolean;
  has_phone?: boolean;
  finance_url?: string | null;
  /** The dealer's own FCA firm reference number, when we hold it (vansales-backend dealers.fca_frn). */
  fca_frn?: string | null;
  /** The dealer's stored Google rating (from the API's dealers table). Absent until the dealer has one. */
  google_rating?: number | null;
  google_review_count?: number | null;
  /** True when the advert takes call-back requests (POST /api/public/listings/{id}/book-call). */
  has_call_booking: boolean;
}

export interface Listing {
  id: string; // canonical id: `${source}:${source_id}`
  source: ListingSource;
  source_id: string;
  tenant_id: number;
  seller_type: SellerType;
  slug: string;
  status: ListingStatus;

  make: string;
  model: string;
  derivative: string;
  condition: Condition;
  year: number;
  plate: string; // UK plate identifier, e.g. "73", "24"

  price: number | null; // GBP; null = price on application
  price_type: PriceType;
  vat_qualifying: boolean;

  mileage: number | null;
  fuel: string;
  transmission: string;
  drivetrain: string;
  colour: string;
  engine_cc: number | null;
  euro_status: string | null; // e.g. "Euro 6"
  ulez: boolean; // ULEZ / clean-air compliant

  van_spec: VanSpec;
  location: ListingLocation;

  description: string;
  features: string[];
  images: ListingImage[];
  seller: Seller;
  enquiry_route: EnquiryRoute;
  /** Direct backend URL for submitting a lead. Populated for marketplace listings; null for other sources. */
  enquiry_url: string | null;
  /** Set for adverts posted from the vansales dealer portal (source "vansales", seller_type "dealer"). Config / Dealski dealers never have it. */
  dealer_contact?: DealerContact;
  /** The registration (private adverts and anything the source publishes). Null/absent = not published. */
  vrm?: string | null;
  /** Dealer's own stock reference (e.g. "SV-2606-1147"). Null when the source doesn't provide one. */
  stock_ref: string | null;
  /** Provenance of `images[0]` — "photo" (the vehicle's own upload) vs a
   *  library/placeholder fallback the source substituted. Optional: only
   *  the dealski source currently reports it (dealski-backend PR #3173);
   *  every other source's own images are always real photos, so leaving
   *  this unset is equivalent to "photo" for the UI's badge check. */
  image_source?: "photo" | "library" | "placeholder";

  /** A finished video of the van (private sellers' adverts: made from their own photos). 16:9 and a 9:16 cut for stories. Null/absent = none. */
  video_url?: string | null;
  video_vertical_url?: string | null;

  /** The seller's own walk-around video (private adverts). When present it is the video to show, ahead of the generated one. */
  seller_video_url?: string | null;
  /** Extras the seller ticked, as {slug,label} (kept apart from `features`, the dealer feed's plain strings); the YouTube embed url; ULEZ, condition, V5 and warranty (private adverts). All optional. */
  extras?: { slug: string; label: string }[];
  youtube_embed_url?: string | null;
  ulez_compliant?: boolean | null;
  /** The seller's own rating of the van (excellent / good / fair / project). Not the new/used `condition`. */
  vehicle_condition?: import("./vanDetails").Condition | null;
  v5_present?: boolean | null;
  /** The HP calculator's warranty add-on tiers for a dealer advert (vansales-backend: admin Settings > Prices; Swiss Vans' tiers). Absent / empty = no warranty block. Price in whole pounds, 0 = included. */
  /** The calculator's representative APR (%), terms and default term for a dealer advert (admin Settings > Prices). Absent = the built-in Swiss Vans values. */
  finance?: { apr: number; terms: number[]; default_term: number } | null;
  warranty_addons?: { name: string; months: number; price: number }[];
  warranty_type?: import("./vanDetails").WarrantyType | null;
  warranty_expiry?: string | null;
  /** The advert's VAT status as recorded; null/absent = unknown (no qualifier shown, never defaulted to inc. VAT). */
  vat_status?: "vat_qualifying" | "ex_vat" | "inc_vat" | "no_vat" | null;
  /** Optional van details from a private seller (body type, wheelbase, roof, doors, seats, weights, service history, engine, Euro class). */
  details?: import("./vanDetails").VanDetails;

  /** MOT facts from the free DVLA / DVSA lookups (private sellers' adverts). Dates are YYYY-MM-DD. Null/absent = unknown. */
  mot_expiry?: string | null;
  last_mot_mileage?: number | null;
  last_mot_date?: string | null;

  /** The paid HPI check findings (private adverts' detail). Null/absent = no check. */
  hpi_check?: HpiCheckPublic | null;

  /** True only when a paid HPI check for this registration came back completely clear (private sellers' adverts). The findings themselves are never public. */
  hpi_checked?: boolean;
  hpi_checked_at?: string | null;

  published_at: string; // ISO
  updated_at: string; // ISO
}

/* ---------------------------------------------------------------------------
   Filters accepted by the data layer. All optional; the client narrows the
   result set in-memory so any source (even a dumb one) supports filtering.
   -------------------------------------------------------------------------*/
export interface ListingFilters {
  /** A dealer's slug: only that dealer's stock (API dealer slug, or a configured dealer's seller names). */
  dealer?: string;
  make?: string;
  model?: string;
  models?: string[]; // multi-model OR filter; overrides model when set
  condition?: Condition;
  bodyStyle?: string; // comma-separated for several (OR)
  wheelbase?: Wheelbase;
  fuel?: string; // comma-separated for several (OR)
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  status?: ListingStatus;
  gearbox?: string;
  colour?: string;
  maxMileage?: number;
  q?: string;
  ulez?: boolean;
  sort?: "newest" | "price_asc" | "price_desc" | "mileage_asc" | "nearest";
  postcode?: string;
  radius?: number; // miles; undefined = Nationwide
  buyerLat?: number;
  buyerLng?: number;
  /** Multi-vehicle OR filter from the chip search: each entry is a make slug, optionally narrowed to one model slug. */
  vehicles?: { make: string; model?: string }[];
  limit?: number; // hard cap (e.g. featured strips); independent of pagination
  page?: number; // 1-based
  pageSize?: number; // when set, results are paginated to this many per page
}

export interface ListingResult {
  listings: Listing[]; // the current page (or all, when unpaginated)
  total: number; // total matches across the FULL catalogue
  page: number;
  pageSize: number;
  totalPages: number;
  servedBy: ListingSource | "mock";
  live: boolean; // true when the live upstream actually answered
  feedTotal: number; // size of the upstream catalogue served
}

export interface FacetCount {
  value: string;
  label: string;
  count: number;
}
export interface ListingFacets {
  makes: FacetCount[];
  models: FacetCount[];
  fuels: FacetCount[];
  bodyStyles: FacetCount[];
  wheelbases: FacetCount[];
  priceRange: { min: number; max: number } | null;
  yearRange: { min: number; max: number } | null;
  total: number;
}
