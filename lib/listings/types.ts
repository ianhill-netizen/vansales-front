/* =============================================================================
   CANONICAL CONTRACT
   The single shape every screen renders. Every source (live Dealski feed,
   native listings, mock fixtures) maps INTO this. Nothing downstream of a
   source adapter should know which source it came from.
   ========================================================================== */

export type ListingSource = "dealski" | "native";
export type SellerType = "dealer" | "private";
export type ListingStatus = "active" | "reserved" | "sold" | "removed";
export type Condition = "used" | "new";
export type PriceType = "inc_vat" | "no_vat";
export type Wheelbase = "swb" | "mwb" | "lwb";
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

  published_at: string; // ISO
  updated_at: string; // ISO
}

/* ---------------------------------------------------------------------------
   Filters accepted by the data layer. All optional; the client narrows the
   result set in-memory so any source (even a dumb one) supports filtering.
   -------------------------------------------------------------------------*/
export interface ListingFilters {
  make?: string;
  model?: string;
  condition?: Condition;
  bodyStyle?: string;
  wheelbase?: Wheelbase;
  fuel?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  status?: ListingStatus;
  q?: string;
  ulez?: boolean;
  sort?: "newest" | "price_asc" | "price_desc" | "mileage_asc";
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
