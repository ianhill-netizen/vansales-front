import { unstable_cache } from "next/cache";
import type { Listing, ListingImage, Wheelbase } from "../types";
import { buildSlug } from "../slug";
import { titleCase } from "../format";

/* =============================================================================
   DEALSKI SOURCE  — live stock feed behind swissvans.dealski.co.uk/stock
   Verified endpoints (public, unauthenticated):
     LIST   GET {BASE}/api/public/stock?make=&model=&page=&per_page=
     DETAIL GET {BASE}/api/public/stock/{id}
     FACETS GET {BASE}/api/public/stock/vehicles/facets
   ALL feed→canonical mapping lives in this one file.

   Reality check (captured at build time): the live feed serves rich
   make/model/spec data but currently NO photos and NO prices, so mapped
   listings legitimately come through with price=null (POA) and image-less
   (the <VanPhoto> SVG renderer covers that). VW Transporters are coded
   T28/T30/T32/T34 upstream and are normalised to model "Transporter" here.
   ========================================================================== */

const BASE =
  process.env.DEALSKI_BASE_URL?.replace(/\/$/, "") ||
  "https://swissvans.dealski.co.uk";
const PER_PAGE = 50; // upstream caps per_page at 50 regardless of request
const PAGE_CONCURRENCY = 6; // polite parallelism while paging the whole feed
const REVALIDATE = 1800; // 30 min — assembled catalogue cache lifetime
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
interface DealskiSummary {
  id: number;
  make: string | null;
  model: string | null;
  variant: string | null;
  colour: string | null;
  fuel: string | null;
  availability_status: string | null;
  primary_photo: string | null;
  photo_count: number;
  our_price: number | null;
  rrp: number | null;
  customer_ref: string | null;
  created_at: string;
  updated_at: string;
}
interface DealskiDetail extends DealskiSummary {
  description: string | null;
  gearbox: string | null;
  seats: number | null;
  mileage: number | null;
  side_doors: number | null;
  rear_doors: number | null;
  rear_door_type: string | null;
  photos: Array<string | { url?: string; alt?: string }> | null;
  vehicle_type: string | null;
  wheelbase: string | null;
  bhp: number | null;
  engine_cc: number | null;
  weight_kg: number | null;
  co2_gkm: number | null;
}

async function getJson<T>(url: string): Promise<T> {
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

function bodyStyleFrom(d: DealskiDetail | DealskiSummary): string {
  const t = ("vehicle_type" in d ? d.vehicle_type : null) ?? "";
  const v = (d.variant ?? "").toLowerCase();
  const hay = `${t} ${v}`.toLowerCase();
  if (hay.includes("luton")) return "Luton";
  if (hay.includes("dropside")) return "Dropside";
  if (hay.includes("tipper")) return "Tipper";
  if (hay.includes("chassis")) return "Chassis Cab";
  if (hay.includes("crew") || hay.includes("double cab") || hay.includes("kombi")) return "Crew Cab";
  if (hay.includes("pickup") || hay.includes("ranger")) return "Pickup";
  return "Panel Van";
}

/** Pull a 4-digit registration year from any text field, else 0 (unknown). */
function yearFrom(...fields: Array<string | null | undefined>): number {
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
      const url = typeof p === "string" ? p : p?.url;
      if (url && url !== d.primary_photo) out.push({ url, alt });
    }
  }
  return out;
}

function mapDetail(d: DealskiDetail): Listing {
  const make = titleCase(d.make ?? "Van");
  const { model, codeDerivative } = normaliseModel(make, d.model);
  const derivative = [codeDerivative, titleCase(d.variant ?? "")].filter(Boolean).join(" ").trim();
  const year = yearFrom(d.variant, d.vehicle_type, d.description);
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
    condition: "used",
    year,
    plate: "",
    price: d.our_price ?? d.rrp ?? null,
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
      body_style: bodyStyleFrom(d),
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
    published_at: d.created_at,
    updated_at: d.updated_at,
  };
}

/** Summaries lack detail fields; map what we have (detail is fetched on demand). */
function mapSummary(s: DealskiSummary): Listing {
  return mapDetail({
    ...s,
    description: null,
    gearbox: null,
    seats: null,
    mileage: null,
    side_doors: null,
    rear_doors: null,
    rear_door_type: null,
    photos: null,
    vehicle_type: null,
    wheelbase: null,
    bhp: null,
    engine_cc: null,
    weight_kg: null,
    co2_gkm: null,
  });
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
  ["dealski-catalogue-v2"],
  { revalidate: REVALIDATE, tags: ["dealski"] },
);

export async function fetchDealskiBySourceId(sourceId: string): Promise<Listing | null> {
  try {
    const d = await getJson<DealskiDetail>(`${BASE}/api/public/stock/${sourceId}`);
    if (!d || !d.id) return null;
    return mapDetail(d);
  } catch {
    return null;
  }
}
