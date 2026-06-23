import type {
  Listing,
  ListingFilters,
  ListingResult,
  ListingSource,
  ListingFacets,
  FacetCount,
} from "./types";
import { getMockListings } from "./sources/mock";
import { getAcmeDemoListings } from "./sources/acme-demo";
import { fetchDealskiCatalogue, fetchDealskiBySourceId } from "./sources/dealski";
import { fetchMarketplaceCatalogue } from "./sources/dealski-marketplace";
import { fetchNativeDbListings, fetchNativeDbListingById } from "./sources/db";
import { sourceIdFromSlug, slugify } from "./slug";
import { resolveModelSlug } from "@/lib/models/image";
import { WHEELBASE_LABEL, titleCase } from "./format";

/* =============================================================================
   DATA LAYER  — the only module screens import.
   Source is chosen by env LISTINGS_SOURCE:
     'marketplace'  — live aggregate feed (dealski-marketplace.ts, authenticated)
     'dealski'      — single-tenant Swiss Vans feed (dealski.ts, unauthenticated)
     'native'       — local DB only
     'mock'         — static fixture data (default / fallback)
   The live source falls back to mock when the upstream is unreachable.
   ========================================================================== */

function configuredSource(): ListingSource | "mock" | "marketplace" {
  const v = (process.env.LISTINGS_SOURCE || "mock").toLowerCase();
  if (v === "marketplace") return "marketplace";
  if (v === "dealski" || v === "native") return v;
  return "mock";
}

/** Load the ENTIRE catalogue from the active source (cached), with fallback.
 *  Native DB listings are always merged on top of the configured source. */
async function loadAll(): Promise<{
  listings: Listing[];
  servedBy: ListingSource | "mock";
  live: boolean;
  feedTotal: number;
}> {
  const source = configuredSource();

  // Always pull native listings from our DB (portal-added stock).
  // Failure is non-fatal — the rest of the catalogue still serves.
  let nativeDb: Listing[] = [];
  try {
    nativeDb = await fetchNativeDbListings();
  } catch {
    /* non-fatal */
  }

  // Always include demo dealer listings so the multi-dealer layout
  // is visible alongside the live feed.
  const demo = getAcmeDemoListings();

  if (source === "marketplace") {
    try {
      const { listings, feedTotal } = await fetchMarketplaceCatalogue();
      if (listings.length > 0) {
        const merged = [...listings, ...nativeDb, ...demo];
        return { listings: merged, servedBy: "dealski", live: true, feedTotal: feedTotal + nativeDb.length + demo.length };
      }
    } catch {
      /* fall through to mock */
    }
    const mock = getMockListings();
    const merged = [...mock, ...nativeDb, ...demo];
    return { listings: merged, servedBy: "mock", live: false, feedTotal: merged.length };
  }

  if (source === "dealski") {
    try {
      const { listings, feedTotal } = await fetchDealskiCatalogue();
      if (listings.length > 0) {
        const merged = [...listings, ...nativeDb, ...demo];
        return { listings: merged, servedBy: "dealski", live: true, feedTotal: feedTotal + nativeDb.length + demo.length };
      }
    } catch {
      /* fall through */
    }
    const mock = getMockListings();
    const merged = [...mock, ...nativeDb, ...demo];
    return { listings: merged, servedBy: "mock", live: false, feedTotal: merged.length };
  }

  // 'native' and 'mock' modes.
  const mock = getMockListings();
  const merged = [...mock, ...nativeDb, ...demo];
  return {
    listings: merged,
    servedBy: source === "native" ? "native" : "mock",
    live: false,
    feedTotal: merged.length,
  };
}

function applyFilters(listings: Listing[], f: ListingFilters): Listing[] {
  let out = listings.filter((l) => l.status !== "removed");

  if (f.condition) out = out.filter((l) => l.condition === f.condition);
  if (f.make) out = out.filter((l) => slugify(l.make) === slugify(f.make!));
  if (f.model) {
    const want = slugify(f.model);
    // The live feed reports verbose model strings (e.g. "Transit Custom 320 L2
    // Diesel FWD"); resolve to the base model so the route collects all variants.
    out = out.filter(
      (l) => slugify(l.model) === want || resolveModelSlug(l.make, l.model)?.modelSlug === want,
    );
  }
  if (f.bodyStyle) out = out.filter((l) => slugify(l.van_spec.body_style) === slugify(f.bodyStyle!));
  if (f.ulez === true) out = out.filter((l) => l.ulez);
  if (f.wheelbase) out = out.filter((l) => l.van_spec.wheelbase === f.wheelbase);
  if (f.fuel) out = out.filter((l) => slugify(l.fuel) === slugify(f.fuel!));
  if (f.status) out = out.filter((l) => l.status === f.status);
  if (f.minYear) out = out.filter((l) => l.year >= f.minYear!);
  if (f.maxYear) out = out.filter((l) => l.year <= f.maxYear!);
  if (f.minPrice != null) out = out.filter((l) => l.price != null && l.price >= f.minPrice!);
  if (f.maxPrice != null) out = out.filter((l) => l.price != null && l.price <= f.maxPrice!);
  if (f.q) {
    const q = f.q.toLowerCase();
    out = out.filter((l) =>
      [l.make, l.model, l.derivative, l.location.town, l.van_spec.body_style, l.colour]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }

  switch (f.sort) {
    case "price_asc":
      out = [...out].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
      break;
    case "price_desc":
      out = [...out].sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
      break;
    case "mileage_asc":
      out = [...out].sort((a, b) => (a.mileage ?? Infinity) - (b.mileage ?? Infinity));
      break;
    case "newest":
    default:
      out = [...out].sort(
        (a, b) => +new Date(b.published_at) - +new Date(a.published_at),
      );
  }

  // Keep active stock ahead of sold/reserved regardless of sort.
  out = [...out].sort((a, b) => statusRank(a) - statusRank(b));
  return out;
}

function statusRank(l: Listing): number {
  return l.status === "active" ? 0 : l.status === "reserved" ? 1 : 2;
}

/* ---------------------------------------------------------------------------
   Public API
   -------------------------------------------------------------------------*/
export async function getListings(filters: ListingFilters = {}): Promise<ListingResult> {
  const { listings, servedBy, live, feedTotal } = await loadAll();
  let filtered = applyFilters(listings, filters);
  const total = filtered.length; // count BEFORE hard cap

  // Optional hard cap for non-paginated strips (e.g. home "featured").
  if (filters.limit && !filters.pageSize) filtered = filtered.slice(0, filters.limit);
  const pageSize = filters.pageSize ?? (filters.limit ? filtered.length || 1 : total || 1);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, filters.page ?? 1), totalPages);

  const pageSlice = filters.pageSize
    ? filtered.slice((page - 1) * pageSize, page * pageSize)
    : filtered;

  return { listings: pageSlice, total, page, pageSize, totalPages, servedBy, live, feedTotal };
}

/** Facets derived from the FULL catalogue, scoped to the given base filters. */
export async function getFacets(base: ListingFilters = {}): Promise<ListingFacets> {
  const { listings } = await loadAll();
  // Apply everything EXCEPT the dimension being counted is overkill here; we
  // scope to make/model context and count the remaining dimensions over matches.
  const scoped = applyFilters(listings, { make: base.make, model: base.model });

  const tally = (key: (l: Listing) => string | null, label?: (v: string) => string): FacetCount[] => {
    const m = new Map<string, number>();
    for (const l of scoped) {
      const v = key(l);
      if (!v) continue;
      m.set(v, (m.get(v) ?? 0) + 1);
    }
    return [...m.entries()]
      .map(([value, count]) => ({ value, label: label ? label(value) : value, count }))
      .sort((a, b) => b.count - a.count);
  };

  const prices = scoped.map((l) => l.price).filter((p): p is number => p != null);
  const years = scoped.map((l) => l.year).filter((y) => y > 0);

  return {
    makes: tally((l) => l.make),
    models: tally((l) => l.model),
    fuels: tally((l) => (l.fuel && l.fuel !== "—" ? titleCase(l.fuel) : null)),
    bodyStyles: tally((l) => l.van_spec.body_style),
    wheelbases: tally(
      (l) => l.van_spec.wheelbase,
      (v) => WHEELBASE_LABEL[v as keyof typeof WHEELBASE_LABEL] ?? v,
    ),
    priceRange: prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null,
    yearRange: years.length ? { min: Math.min(...years), max: Math.max(...years) } : null,
    total: scoped.length,
  };
}

export async function getListingBySlug(slug: string): Promise<{ listing: Listing | null; servedBy: ListingSource | "mock" }> {
  const source = configuredSource();
  const sourceId = sourceIdFromSlug(slug);

  // Always try native DB first (portal-added listings are always resolvable).
  const nativeListing = await fetchNativeDbListingById(sourceId).catch(() => null);
  if (nativeListing) return { listing: nativeListing, servedBy: "native" };

  if (source === "marketplace") {
    // Hit the per-tenant detail endpoint for full spec + multi-photo support.
    // Works for SwissVans (the only current marketplace tenant) since vehicle
    // IDs are stable across the aggregate and per-tenant endpoints.
    const live = await fetchDealskiBySourceId(sourceId);
    if (live) return { listing: { ...live, enquiry_url: live.enquiry_url }, servedBy: "dealski" };
    // Fall through to the cached catalogue (covers the case when the per-tenant
    // endpoint is temporarily unavailable).
    const { listings: catalogue } = await fetchMarketplaceCatalogue().catch(() => ({ listings: [] as Listing[] }));
    const cached = catalogue.find((l) => l.source_id === sourceId || l.slug === slug);
    if (cached) return { listing: cached, servedBy: "dealski" };
  }

  if (source === "dealski") {
    const live = await fetchDealskiBySourceId(sourceId);
    if (live) return { listing: live, servedBy: "dealski" };
  }

  const all = [...getMockListings(), ...getAcmeDemoListings()];
  const listing =
    all.find((l) => l.slug === slug) ||
    all.find((l) => l.source_id === sourceId) ||
    null;
  return { listing, servedBy: source === "native" ? "native" : "mock" };
}

/** Distinct make/model pairs present in the active source — powers sitemap + nav. */
export async function getModelIndex(): Promise<Array<{ make: string; model: string; count: number }>> {
  const { listings } = await loadAll();
  const map = new Map<string, { make: string; model: string; count: number }>();
  for (const l of listings) {
    const key = `${slugify(l.make)}/${slugify(l.model)}`;
    const cur = map.get(key);
    if (cur) cur.count += 1;
    else map.set(key, { make: l.make, model: l.model, count: 1 });
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}
