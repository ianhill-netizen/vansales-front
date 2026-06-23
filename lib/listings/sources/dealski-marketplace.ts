import { unstable_cache } from "next/cache";
import type { Listing, ListingImage, Wheelbase } from "../types";
import { buildSlug } from "../slug";
import { titleCase } from "../format";

/* =============================================================================
   DEALSKI MARKETPLACE SOURCE  — aggregate feed across all opted-in tenants.
   Endpoint: DEALSKI_MARKETPLACE_URL  (GET, authenticated)
   Auth:     X-API-Key: DEALSKI_MARKETPLACE_KEY (landlord-mode key)

   Response shape mirrors the per-tenant /api/public/stock/vehicles feed but
   includes dealer attribution (name, city, county, postcode) and enquiry_url
   for leads-back.  Price is in GBP (pounds).  Photos: primary_photo on list
   (24-hour presigned S3 URL); full photo array requires a detail fetch to the
   per-tenant endpoint (not done here — catalogue serves the primary photo only).
   ========================================================================== */

const MARKETPLACE_URL = (
  process.env.DEALSKI_MARKETPLACE_URL ||
  `${(process.env.DEALSKI_API_URL ?? "https://swissvans.dealski.co.uk").replace(/\/$/, "")}/api/marketplace/stock`
).replace(/\/$/, "");
const MARKETPLACE_KEY = process.env.DEALSKI_MARKETPLACE_KEY ?? "";

const PER_PAGE = 100; // marketplace endpoint caps at 100
const REVALIDATE = 21600; // 6 h — must be < 24 h (presigned photo URL TTL)
const TIMEOUT_MS = 15000;
const HARD_CURSOR_CAP = 50; // safety backstop (~5 000 vehicles)

/* ---------------------------------------------------------------------------
   API response types
   -------------------------------------------------------------------------*/
interface MarketplaceDealer {
  name: string;
  city: string | null;
  county: string | null;
  postcode: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
}

interface MarketplaceVehicle {
  id: number;
  dealer_id: string;   // Dealski tenant primary key, e.g. "swissvans"
  dealer_slug: string; // domain-derived slug, same value as dealer_id today
  tenant_slug: string; // retained for backward compat
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
  availability_status: string | null;
  rrp: number | null;
  price: number | null; // GBP pounds
  customer_ref: string | null;
  primary_photo: string | null; // 24-h presigned S3 URL; null = no photos yet
  photo_count: number;
  created_at: string;
  updated_at: string;
  dealer: MarketplaceDealer | null;
  enquiry_url: string | null;
}

interface MarketplacePage {
  data: MarketplaceVehicle[];
  meta: { per_page: number; total: number; has_more: boolean; next_cursor: string | null };
}

/* ---------------------------------------------------------------------------
   HTTP helpers (same retry pattern as dealski.ts)
   -------------------------------------------------------------------------*/
async function fetchPage(url: string, tries = 3): Promise<MarketplacePage> {
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fetchPageOnce(url);
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 300 * (i + 1)));
    }
  }
  throw lastErr;
}

async function fetchPageOnce(url: string): Promise<MarketplacePage> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${MARKETPLACE_KEY}`,
      },
      signal: ctrl.signal,
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) throw new Error(`Marketplace ${res.status} for ${url}`);
    return (await res.json()) as MarketplacePage;
  } finally {
    clearTimeout(timer);
  }
}

/* ---------------------------------------------------------------------------
   Normalisers (identical to dealski.ts)
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

function bodyStyleFrom(d: MarketplaceVehicle): string {
  const t = d.vehicle_type ?? "";
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

function imagesFrom(d: MarketplaceVehicle, alt: string): ListingImage[] {
  if (!d.primary_photo) return [];
  return [{ url: d.primary_photo, alt }];
}

function locationFromDealer(dealer: MarketplaceDealer | null): {
  town: string;
  region: string;
  postcode_area: string;
} {
  if (!dealer) return { town: "UK", region: "UK", postcode_area: "" };
  const town = [dealer.city, dealer.county].filter(Boolean).join(", ") || "UK";
  const region = dealer.county || "UK";
  const postcodeArea = dealer.postcode?.match(/^([A-Z]{1,2})/)?.[1] ?? "";
  return { town, region, postcode_area: postcodeArea };
}

/* ---------------------------------------------------------------------------
   Mapper
   -------------------------------------------------------------------------*/
function mapVehicle(d: MarketplaceVehicle): Listing {
  const make = titleCase(d.make ?? "Van");
  const { model, codeDerivative } = normaliseModel(make, d.model);
  const derivative = [codeDerivative, titleCase(d.variant ?? "")].filter(Boolean).join(" ").trim();
  const year = yearFrom(d.first_registration_date, d.variant, d.vehicle_type);
  const source_id = String(d.id);
  const alt = `${make} ${model} ${derivative}`.trim();
  const doors = (d.side_doors ?? 0) + (d.rear_doors ?? 0) || (d.rear_door_type ? 2 : null);
  // Use dealer.name for display (enables existing getDealerConfigBySeller lookup).
  // Fall back through dealer_slug → tenant_slug for tenants without a dealer record.
  const sellerName = d.dealer?.name ?? d.dealer_slug ?? d.tenant_slug;
  const { town, region, postcode_area } = locationFromDealer(d.dealer);

  return {
    id: `dealski:${source_id}`,
    source: "dealski",
    source_id,
    tenant_id: 0,
    seller_type: "dealer",
    slug: buildSlug({ make, model, derivative, town, source_id }),
    status: normaliseStatus(d.availability_status),
    make,
    model,
    derivative,
    condition: "used",
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
      body_style: bodyStyleFrom(d),
      wheelbase: normaliseWheelbase(d.wheelbase) ?? inferWheelbase(d.model, d.variant, d.vehicle_type),
      roof_height: null,
      payload_kg: null,
      load_length_mm: null,
      doors,
    },
    location: {
      town,
      region,
      postcode_area,
      lat: null,
      lng: null,
    },
    description: `${alt}. Contact ${sellerName} for full details and availability.`,
    features: [],
    images: imagesFrom(d, alt),
    seller: { name: sellerName, type: "dealer", logo: null, rating: null },
    enquiry_route: { to: "marketplace", ref: d.stock_number ?? d.customer_ref ?? source_id },
    enquiry_url: d.enquiry_url ?? null,
    stock_ref: d.stock_number ?? d.customer_ref ?? null,
    published_at: d.created_at,
    updated_at: d.updated_at,
  };
}

/* ---------------------------------------------------------------------------
   Pagination — cursor-based (has_more / next_cursor).
   Sequential by design: each cursor encodes position in the previous page,
   so pages cannot be fetched in parallel.
   -------------------------------------------------------------------------*/
async function fetchAllVehicles(): Promise<{ vehicles: MarketplaceVehicle[]; feedTotal: number }> {
  if (!MARKETPLACE_KEY) {
    throw new Error("Marketplace: DEALSKI_MARKETPLACE_KEY not configured");
  }

  const vehicles: MarketplaceVehicle[] = [];
  let nextCursor: string | null = null;
  let feedTotal = 0;
  let pages = 0;

  do {
    const url = new URL(MARKETPLACE_URL);
    url.searchParams.set("per_page", String(PER_PAGE));
    if (nextCursor) url.searchParams.set("cursor", nextCursor);

    const page = await fetchPage(url.toString());
    vehicles.push(...page.data);
    feedTotal = page.meta.total;
    nextCursor = page.meta.has_more ? page.meta.next_cursor : null;
    pages++;

    if (pages >= HARD_CURSOR_CAP) {
      console.warn(`[dealski-marketplace] hit cursor cap (${HARD_CURSOR_CAP} pages) — stopping early`);
      break;
    }
  } while (nextCursor);

  return { vehicles, feedTotal };
}

/* ---------------------------------------------------------------------------
   Public API
   -------------------------------------------------------------------------*/
export const fetchMarketplaceCatalogue = unstable_cache(
  async (): Promise<{ listings: Listing[]; feedTotal: number }> => {
    const { vehicles, feedTotal } = await fetchAllVehicles();

    if (feedTotal > 0 && vehicles.length < feedTotal - PER_PAGE / 2) {
      throw new Error(`Marketplace: incomplete catalogue (${vehicles.length}/${feedTotal})`);
    }

    const seen = new Set<string>();
    const listings: Listing[] = [];
    for (const v of vehicles) {
      // Dedup key includes tenant_slug so same vehicle ID from two tenants doesn't collide.
      const key = `${v.tenant_slug}:${v.id}`;
      if (v.id == null || seen.has(key)) continue;
      seen.add(key);
      listings.push(mapVehicle(v));
    }

    return { listings, feedTotal };
  },
  ["dealski-marketplace-v2"],
  { revalidate: REVALIDATE, tags: ["dealski-marketplace"] },
);
