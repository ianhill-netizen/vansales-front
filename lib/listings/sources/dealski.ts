import { unstable_cache } from "next/cache";
import type { Listing, ListingImage, Wheelbase } from "../types";
import { buildSlug } from "../slug";
import { titleCase } from "../format";

/* =============================================================================
   DEALSKI SOURCE  — live stock feed behind swissvans.dealski.co.uk
   Verified endpoints (public, unauthenticated):
     LIST   GET {BASE}/api/public/stock?page=&per_page=
     DETAIL GET {BASE}/api/public/stock/vehicles/{id}  → wrapped in { data: {...} }
   ALL feed→canonical mapping lives in this one file.

   List price field: `our_price` (GBP pounds). Detail price field: `price`.
   List is sparse (15 fields). Detail has full spec + photos[].preview_url.
   Photo preview_url values are 24-hour S3 presigned URLs — the feed cache
   (REVALIDATE) is kept at 6 h so they are re-signed well within their TTL.
   ========================================================================== */

const BASE =
  process.env.DEALSKI_BASE_URL?.replace(/\/$/, "") ||
  "https://swissvans.dealski.co.uk";
const PER_PAGE = 50; // upstream caps per_page at 50 regardless of request
const PAGE_CONCURRENCY = 6; // polite parallelism while paging the whole feed
const REVALIDATE = 21600; // 6 h — must be < 24 h (S3 presigned photo TTL)
const TIMEOUT_MS = 12000;
const HARD_PAGE_CAP = 60; // safety backstop (~3000 vehicles) vs a runaway feed

/* The single dealer behind tenant 1 (Swiss Vans, Swansea). The feed has no
   per-vehicle location, so all of this dealer's stock shares their forecourt. */
const DEALER = {
  tenant_id: 1,
  seller: "Swiss Vans",
  town: "Swansea",
  region: "Wales",
  postcode_area: "SA",
  lat: 51.6995,
  lng: -3.9319,
};

interface DealskiList {
  data: DealskiSummary[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

/* Shape returned by GET /api/public/stock (list endpoint — sparse).
   Only 15 fields. Spec data (gearbox, wheelbase, year, mileage, etc.) is
   absent — those come from the per-vehicle detail endpoint.
   Price field is `our_price`; `primary_photo` is the raw S3 key or null. */
interface DealskiSummary {
  id: number;
  make: string | null;
  model: string | null;
  variant: string | null;
  seats: number | null;
  colour: string | null;
  fuel: string | null;
  availability_status: string | null;
  primary_photo: string | null;
  photo_count: number;
  created_at: string;
  updated_at: string;
  our_price: number | null; // GBP pounds; named `price` on the detail endpoint
  rrp: number | null;
  customer_ref: string | null;
}

/* Shape returned by GET /api/public/stock/vehicles/{id} — response is wrapped
   in { data: DealskiDetail }. Full spec including gearbox, wheelbase, year,
   mileage, description, and presigned photo URLs. Price field is `price`. */
interface DealskiDetail {
  id: number;
  stock_number: string | null;
  make: string | null;
  model: string | null;
  variant: string | null;
  display_name: string | null;
  seats: number | null;
  colour: string | null;
  fuel: string | null;
  gearbox: string | null;
  vehicle_type: string | null;
  wheelbase: string | null;
  bhp: number | null;
  engine_cc: number | null;
  co2_gkm: number | null;
  weight_kg: number | null;
  mileage: number | null;
  side_doors: number | null;
  rear_doors: number | null;
  rear_door_type: string | null;
  first_registration_date: string | null;
  mot_expires: string | null;
  factory_extras: string | null;
  swiss_extras: string | null;
  availability_status: string | null;
  rrp: number | null;
  price: number | null; // GBP pounds (named `our_price` on the list endpoint)
  customer_ref: string | null;
  primary_photo: string | null;
  photo_count: number;
  created_at: string;
  updated_at: string;
  description: string | null;
  photos: Array<{ id: number; preview_url: string; sort_order: number; is_primary: boolean }> | null;
}

async function getJsonOnce<T>(url: string): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      // Note: with Accept: application/json (and no browser UA) the upstream
      // returns clean JSON; the site's malware only injects spam HTML for
      // browser-like requests. Still parse defensively in case that changes.
      headers: { Accept: "application/json" },
      signal: ctrl.signal,
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) throw new Error(`Dealski ${res.status} for ${url}`);
    const text = await res.text();
    try {
      return JSON.parse(text) as T;
    } catch {
      return extractJson<T>(text);
    }
  } finally {
    clearTimeout(timer);
  }
}

/** Retry transient failures — a dropped page would silently lose 50 vehicles. */
async function getJson<T>(url: string, tries = 3): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await getJsonOnce<T>(url);
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 300 * (i + 1)));
    }
  }
  throw lastErr;
}

/** Extract the first balanced JSON value, tolerating any trailing injected HTML. */
function extractJson<T>(text: string): T {
  const candidates = [text.indexOf("["), text.indexOf("{")].filter((i) => i >= 0);
  if (!candidates.length) throw new Error("Dealski: no JSON in response");
  const start = Math.min(...candidates);
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "[" || c === "{") depth++;
    else if (c === "]" || c === "}") {
      depth--;
      if (depth === 0) return JSON.parse(text.slice(start, i + 1)) as T;
    }
  }
  throw new Error("Dealski: unbalanced JSON in response");
}

async function mapWithConcurrency<I, O>(
  items: I[],
  limit: number,
  fn: (item: I) => Promise<O>,
): Promise<O[]> {
  const out: O[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const i = cursor++;
      out[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

/* ---------------------------------------------------------------------------
   Normalisers
   -------------------------------------------------------------------------*/
const VW_TRANSPORTER_CODES = new Set(["t26", "t28", "t30", "t32", "t34"]);

function normaliseModel(make: string, model: string | null): { model: string; codeDerivative: string } {
  const raw = (model ?? "").trim();
  const lower = raw.toLowerCase();
  if (make.toLowerCase() === "volkswagen" && VW_TRANSPORTER_CODES.has(lower)) {
    return { model: "Transporter", codeDerivative: raw.toUpperCase() };
  }
  return { model: titleCase(raw) || "Van", codeDerivative: "" };
}

function normaliseWheelbase(wb: string | null): Wheelbase | null {
  const v = (wb ?? "").toLowerCase();
  if (v.includes("swb") || v.includes("short")) return "swb";
  if (v.includes("mwb") || v.includes("med")) return "mwb";
  if (v.includes("lwb") || v.includes("long")) return "lwb";
  return null;
}

/* The list endpoint omits wheelbase, but the verbose model/variant strings carry
   length codes (L1/L2/L3/L4) and SWB/MWB/LWB tokens — infer from those so the
   wheelbase filter works across the full catalogue without per-vehicle detail. */
function inferWheelbase(...text: Array<string | null | undefined>): Wheelbase | null {
  const hay = text.filter(Boolean).join(" ").toLowerCase();
  if (/\bswb\b|\bl1\b|short/.test(hay)) return "swb";
  if (/\bmwb\b|\bl2\b|medium/.test(hay)) return "mwb";
  if (/\blwb\b|\bl3\b|\bl4\b|long|maxi/.test(hay)) return "lwb";
  return null;
}

function normaliseTransmission(gearbox: string | null): string {
  const v = (gearbox ?? "").toLowerCase();
  if (v.startsWith("auto") || v === "dsg") return "Automatic";
  if (v.startsWith("man")) return "Manual";
  return gearbox ? titleCase(gearbox) : "—";
}

function normaliseStatus(s: string | null): Listing["status"] {
  switch ((s ?? "").toLowerCase()) {
    case "reserved":
      return "reserved";
    case "sold":
      return "sold";
    case "removed":
    case "unavailable":
      return "removed";
    default:
      return "active";
  }
}

function bodyStyleFrom(vehicleType: string | null | undefined, variant: string | null | undefined): string {
  const hay = `${vehicleType ?? ""} ${variant ?? ""}`.toLowerCase();
  if (hay.includes("luton")) return "Luton";
  if (hay.includes("dropside")) return "Dropside";
  if (hay.includes("tipper")) return "Tipper";
  if (hay.includes("chassis")) return "Chassis Cab";
  if (hay.includes("crew") || hay.includes("double cab") || hay.includes("kombi")) return "Crew Cab";
  if (hay.includes("pickup") || hay.includes("ranger")) return "Pickup";
  return "Panel Van";
}

/** Pull registration year: prefer the DVLA-verified date, fall back to text scan. */
function yearFrom(firstRegDate: string | null, ...fields: Array<string | null | undefined>): number {
  if (firstRegDate) {
    const y = parseInt(firstRegDate.slice(0, 4), 10);
    if (y >= 2000 && y <= 2099) return y;
  }
  for (const f of fields) {
    const m = (f ?? "").match(/\b(20[12]\d)\b/);
    if (m) return Number(m[1]);
  }
  return 0;
}

function imagesFrom(d: DealskiDetail | DealskiSummary, alt: string): ListingImage[] {
  const out: ListingImage[] = [];
  if (d.primary_photo) out.push({ url: d.primary_photo, alt });
  if ("photos" in d && Array.isArray(d.photos)) {
    for (const p of d.photos) {
      const url = p?.preview_url;
      if (url && url !== d.primary_photo) out.push({ url, alt });
    }
  }
  return out;
}

/* Neither the list nor detail endpoint carries an explicit condition field.
   Default to "new"; will flip to "used" if Dealski adds the field in future. */
function conditionFrom(availability_status: string | null): "new" | "used" {
  return (availability_status ?? "").toLowerCase() === "used" ? "used" : "new";
}

function mapDetail(d: DealskiDetail): Listing {
  const make = titleCase(d.make ?? "Van");
  const { model, codeDerivative } = normaliseModel(make, d.model);
  const derivative = [codeDerivative, titleCase(d.variant ?? "")].filter(Boolean).join(" ").trim();
  const year = yearFrom(d.first_registration_date, d.variant, d.vehicle_type, d.description);
  const source_id = String(d.id);
  const alt = `${make} ${model} ${derivative}`.trim();
  const doors =
    (d.side_doors ?? 0) + (d.rear_doors ?? 0) || (d.rear_door_type ? 2 : null);

  return {
    id: `dealski:${source_id}`,
    source: "dealski",
    source_id,
    tenant_id: DEALER.tenant_id,
    seller_type: "dealer",
    slug: buildSlug({ make, model, derivative, town: DEALER.town, source_id }),
    status: normaliseStatus(d.availability_status),
    make,
    model,
    derivative,
    condition: conditionFrom(d.availability_status),
    year,
    plate: "",
    price: d.price ?? null,
    price_type: "inc_vat",
    vat_qualifying: true,
    mileage: d.mileage ?? null,
    fuel: d.fuel ? titleCase(d.fuel) : "—",
    transmission: normaliseTransmission(d.gearbox),
    drivetrain: "FWD",
    colour: d.colour ? titleCase(d.colour) : "—",
    engine_cc: d.engine_cc ?? null,
    euro_status: null,
    ulez: year === 0 ? true : year >= 2016,
    van_spec: {
      body_style: bodyStyleFrom(d.vehicle_type, d.variant),
      wheelbase: normaliseWheelbase(d.wheelbase) ?? inferWheelbase(d.model, d.variant, d.vehicle_type),
      roof_height: null,
      payload_kg: null,
      load_length_mm: null,
      doors,
    },
    location: {
      town: DEALER.town,
      region: DEALER.region,
      postcode_area: DEALER.postcode_area,
      lat: DEALER.lat,
      lng: DEALER.lng,
    },
    description: d.description ?? `${alt}. Contact ${DEALER.seller} for full details and availability.`,
    features: [],
    images: imagesFrom(d, alt),
    seller: { name: DEALER.seller, type: "dealer", logo: null, rating: 4.8 },
    enquiry_route: { to: "dealski_tenant", ref: d.customer_ref ?? source_id },
    enquiry_url: null,
    stock_ref: d.customer_ref ?? null,
    published_at: d.created_at,
    updated_at: d.updated_at,
  };
}

/** Map a sparse list-endpoint row. Spec fields absent from the list are left
 *  null/defaulted; the detail fetch on the listing page fills them in. */
function mapSummary(s: DealskiSummary): Listing {
  const make = titleCase(s.make ?? "Van");
  const { model, codeDerivative } = normaliseModel(make, s.model);
  const derivative = [codeDerivative, titleCase(s.variant ?? "")].filter(Boolean).join(" ").trim();
  const source_id = String(s.id);
  const alt = `${make} ${model} ${derivative}`.trim();

  return {
    id: `dealski:${source_id}`,
    source: "dealski",
    source_id,
    tenant_id: DEALER.tenant_id,
    seller_type: "dealer",
    slug: buildSlug({ make, model, derivative, town: DEALER.town, source_id }),
    status: normaliseStatus(s.availability_status),
    make,
    model,
    derivative,
    condition: conditionFrom(s.availability_status),
    year: 0,   // not present in list endpoint; resolved on detail page
    plate: "",
    price: s.our_price ?? null,
    price_type: "inc_vat",
    vat_qualifying: true,
    mileage: null,   // not present in list endpoint
    fuel: s.fuel ? titleCase(s.fuel) : "—",
    transmission: "—", // not present in list endpoint
    drivetrain: "FWD",
    colour: s.colour ? titleCase(s.colour) : "—",
    engine_cc: null,
    euro_status: null,
    ulez: true, // optimistic default — no year from list; resolved on detail page
    van_spec: {
      body_style: bodyStyleFrom(null, s.variant), // vehicle_type absent from list
      wheelbase: inferWheelbase(s.model, s.variant),
      roof_height: null,
      payload_kg: null,
      load_length_mm: null,
      doors: null,
    },
    location: {
      town: DEALER.town,
      region: DEALER.region,
      postcode_area: DEALER.postcode_area,
      lat: DEALER.lat,
      lng: DEALER.lng,
    },
    description: `${alt}. Contact ${DEALER.seller} for full details and availability.`,
    features: [],
    images: s.primary_photo ? [{ url: s.primary_photo, alt }] : [],
    seller: { name: DEALER.seller, type: "dealer", logo: null, rating: 4.8 },
    enquiry_route: { to: "dealski_tenant", ref: s.customer_ref ?? source_id },
    enquiry_url: null,
    stock_ref: s.customer_ref ?? null,
    published_at: s.created_at,
    updated_at: s.updated_at,
  };
}

/* ---------------------------------------------------------------------------
   Public source API
   -------------------------------------------------------------------------*/

/** Page through the ENTIRE upstream catalogue (all ~1,121 vehicles). */
async function fetchAllSummaries(): Promise<{ summaries: DealskiSummary[]; feedTotal: number }> {
  const first = await getJson<DealskiList>(`${BASE}/api/public/stock?per_page=${PER_PAGE}&page=1`);
  const lastPage = Math.min(first.meta.last_page || 1, HARD_PAGE_CAP);
  const restPages = Array.from({ length: Math.max(0, lastPage - 1) }, (_, i) => i + 2);
  const rest = await mapWithConcurrency(restPages, PAGE_CONCURRENCY, (page) =>
    getJson<DealskiList>(`${BASE}/api/public/stock?per_page=${PER_PAGE}&page=${page}`).then(
      (r) => r.data,
      () => [] as DealskiSummary[],
    ),
  );
  const summaries = [first.data, ...rest].flat();
  return { summaries, feedTotal: first.meta.total ?? summaries.length };
}

/** Assemble + map the full catalogue, cached so requests don't refetch 1,121 rows. */
export const fetchDealskiCatalogue = unstable_cache(
  async (): Promise<{ listings: Listing[]; feedTotal: number }> => {
    const { summaries, feedTotal } = await fetchAllSummaries();
    // Don't cache a truncated catalogue: if a page hard-failed (after retries)
    // the raw row count falls well short of the feed's reported total — throw so
    // unstable_cache stores nothing and the next request retries.
    if (feedTotal > 0 && summaries.length < feedTotal - PER_PAGE / 2) {
      throw new Error(`Dealski: incomplete catalogue (${summaries.length}/${feedTotal})`);
    }
    // De-dupe by id (defensive against feed overlap), then map to canonical.
    const seen = new Set<number>();
    const listings: Listing[] = [];
    for (const s of summaries) {
      if (s.id == null || seen.has(s.id)) continue;
      seen.add(s.id);
      listings.push(mapSummary(s));
    }
    return { listings, feedTotal };
  },
  // Bump this key whenever the feed→canonical mapping changes (busts the cache).
  ["dealski-catalogue-v5"],
  { revalidate: REVALIDATE, tags: ["dealski"] },
);

export async function fetchDealskiBySourceId(sourceId: string): Promise<Listing | null> {
  try {
    // Detail endpoint wraps the vehicle in { data: {...} }
    const wrapper = await getJson<{ data: DealskiDetail }>(`${BASE}/api/public/stock/vehicles/${sourceId}`);
    const d = wrapper?.data;
    if (!d || !d.id) return null;
    return mapDetail(d);
  } catch {
    return null;
  }
}
