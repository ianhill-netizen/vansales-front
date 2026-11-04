import { cache } from "react";
import { unstable_cache } from "next/cache";
import type {
  Listing,
  ListingFilters,
  ListingResult,
  ListingSource,
  ListingFacets,
  FacetCount,
} from "./types";
import { haversineDistanceMiles } from "../distance";
import { getMockListings } from "./sources/mock";
import { getAcmeDemoListings } from "./sources/acme-demo";
import { fetchDealskiCatalogue, fetchDealskiBySourceId } from "./sources/dealski";
import { fetchMarketplaceCatalogue } from "./sources/dealski-marketplace";
import { fetchNativeDbListings, fetchNativeDbListingById } from "./sources/db";
import { fetchPrivateSellerListings, fetchPrivateSellerListingBySlug, fetchDealerPortalListings, fetchDealerPortalListingBySlug, PRIVATE_SLUG_PREFIX, DEALER_SLUG_PREFIX } from "./sources/vansales";
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

/* ---------------------------------------------------------------------------
   SLOW-UPSTREAM GUARDS
   The native-listings database and the private-sellers feed are "nice to have":
   the site must render without them. Before this, loadAll() awaited the database
   serially, uncached, with no timeout, and swallowed the error silently: when the
   database was unreachable EVERY render waited ~15 s per call (a model page calls
   loadAll twice: ~31 s; a 404 did a database lookup first: ~19 s) and static
   generation blew Vercel's 60 s per-page limit, failing the production build.
   Now: bounded (EXTRAS_BUDGET_MS), run in parallel with the main feed, cached for
   60 s (outages included, so a dead database costs one short wait a minute, not
   one per request), memoised per request, and the failure is logged.
   -------------------------------------------------------------------------*/
const EXTRAS_BUDGET_MS = 2500;

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} took longer than ${ms}ms`)), ms);
  });
  return Promise.race([p, timeout]).finally(() => clearTimeout(timer));
}

/** Native (portal-added) listings + private sellers' adverts + vansales dealer-portal adverts. Never throws; an upstream that fails or is slow contributes nothing for the next 60 s. */
const loadExtras = unstable_cache(
  async (): Promise<Listing[]> => {
    const t0 = Date.now();
    const [native, priv, dealerAdverts] = await Promise.all([
      withTimeout(fetchNativeDbListings(), EXTRAS_BUDGET_MS, "native listings (database)").catch((e: Error) => {
        console.warn(`[listings] native listings skipped after ${Date.now() - t0}ms: ${e.message}`);
        return [] as Listing[];
      }),
      withTimeout(fetchPrivateSellerListings(), EXTRAS_BUDGET_MS * 2, "private sellers feed").catch((e: Error) => {
        console.warn(`[listings] private sellers' adverts skipped after ${Date.now() - t0}ms: ${e.message}`);
        return [] as Listing[];
      }),
      withTimeout(fetchDealerPortalListings(), EXTRAS_BUDGET_MS * 2, "dealer portal adverts").catch((e: Error) => {
        console.warn(`[listings] dealer portal adverts skipped after ${Date.now() - t0}ms: ${e.message}`);
        return [] as Listing[];
      }),
    ]);
    return [...native, ...priv, ...dealerAdverts];
  },
  ["listing-extras-v2"],
  { revalidate: 60, tags: ["listing-extras"] },
);

/** The ACME Road Runner fixtures are for previewing the multi-dealer layout only. They never reach public responses unless SHOW_DEMO_LISTINGS=true (the data stays in the repo). */
function demoListings(): Listing[] {
  return process.env.SHOW_DEMO_LISTINGS === "true" ? getAcmeDemoListings() : [];
}

function configuredSource(): ListingSource | "mock" | "marketplace" {
  const v = (process.env.LISTINGS_SOURCE || "mock").toLowerCase();
  if (v === "marketplace") return "marketplace";
  if (v === "dealski" || v === "native") return v;
  return "mock";
}

/** Load the ENTIRE catalogue from the active source (cached), with fallback.
 *  Native DB listings are always merged on top of the configured source. */
async function loadAllUncached(): Promise<{
  listings: Listing[];
  servedBy: ListingSource | "mock";
  live: boolean;
  feedTotal: number;
}> {
  const source = configuredSource();

  // Native listings + private sellers' adverts start NOW, in parallel with the main feed below, and are awaited only when merging.
  const extrasP = loadExtras().catch(() => [] as Listing[]);

  // Demo dealer listings are opt-in (SHOW_DEMO_LISTINGS) and off in production.
  const demo = demoListings();

  if (source === "marketplace") {
    // Primary: authenticated aggregate feed (cursor-paginated, multi-tenant).
    try {
      const { listings, feedTotal } = await fetchMarketplaceCatalogue();
      if (listings.length > 0) {
        console.info(`[listings] served by marketplace feed (${listings.length} vehicles)`);
        const merged = [...listings, ...(await extrasP), ...demo];
        return { listings: merged, servedBy: "dealski", live: true, feedTotal: feedTotal + (await extrasP).length + demo.length };
      }
      console.warn("[listings] marketplace returned 0 vehicles — falling back to legacy feed");
    } catch (err) {
      console.warn("[listings] marketplace feed error, falling back to legacy feed:", (err as Error).message);
    }
    // Secondary: unauthenticated single-tenant legacy feed (keeps site live if key/endpoint breaks).
    try {
      const { listings, feedTotal } = await fetchDealskiCatalogue();
      if (listings.length > 0) {
        console.info(`[listings] served by legacy dealski feed (${listings.length} vehicles)`);
        const merged = [...listings, ...(await extrasP), ...demo];
        return { listings: merged, servedBy: "dealski", live: true, feedTotal: feedTotal + (await extrasP).length + demo.length };
      }
    } catch {
      /* fall through to mock */
    }
    console.warn("[listings] both dealski feeds failed — serving mock data");
    const mock = getMockListings();
    const merged = [...mock, ...(await extrasP), ...demo];
    return { listings: merged, servedBy: "mock", live: false, feedTotal: merged.length };
  }

  if (source === "dealski") {
    try {
      const { listings, feedTotal } = await fetchDealskiCatalogue();
      if (listings.length > 0) {
        const merged = [...listings, ...(await extrasP), ...demo];
        return { listings: merged, servedBy: "dealski", live: true, feedTotal: feedTotal + (await extrasP).length + demo.length };
      }
    } catch {
      /* fall through */
    }
    const mock = getMockListings();
    const merged = [...mock, ...(await extrasP), ...demo];
    return { listings: merged, servedBy: "mock", live: false, feedTotal: merged.length };
  }

  // 'native' and 'mock' modes.
  const mock = getMockListings();
  const merged = [...mock, ...(await extrasP), ...demo];
  return {
    listings: merged,
    servedBy: source === "native" ? "native" : "mock",
    live: false,
    feedTotal: merged.length,
  };
}


/** One catalogue load per request: getListings() and getFacets() on the same page share it. */
const loadAll = cache(loadAllUncached);

const csv = (v: string) => v.split(",").map((s) => s.trim()).filter(Boolean);

function applyFilters(listings: Listing[], f: ListingFilters): Listing[] {
  let out = listings.filter((l) => l.status !== "removed");

  if (f.condition) out = out.filter((l) => l.condition === f.condition);
  if (f.make) out = out.filter((l) => slugify(l.make) === slugify(f.make!));
  if (f.models && f.models.length > 0) {
    // Multi-model OR filter: listing matches if its model matches any selected slug.
    const wants = f.models.map(slugify);
    out = out.filter((l) =>
      wants.some(
        (w) => slugify(l.model) === w || resolveModelSlug(l.make, l.model)?.modelSlug === w,
      ),
    );
  } else if (f.model) {
    const want = slugify(f.model);
    // The live feed reports verbose model strings (e.g. "Transit Custom 320 L2
    // Diesel FWD"); resolve to the base model so the route collects all variants.
    out = out.filter(
      (l) => slugify(l.model) === want || resolveModelSlug(l.make, l.model)?.modelSlug === want,
    );
  }
  if (f.vehicles && f.vehicles.length > 0) {
    // Chip search: a listing matches if it matches ANY chip (make, or make + model).
    out = out.filter((l) =>
      f.vehicles!.some((v) => {
        if (slugify(l.make) !== slugify(v.make)) return false;
        if (!v.model) return true;
        const want = slugify(v.model);
        return slugify(l.model) === want || resolveModelSlug(l.make, l.model)?.modelSlug === want;
      }),
    );
  }
  if (f.bodyStyle) {
    const wants = csv(f.bodyStyle).map(slugify);
    out = out.filter((l) => wants.includes(slugify(l.van_spec.body_style)));
  }
  if (f.ulez === true) out = out.filter((l) => l.ulez);
  if (f.wheelbase) out = out.filter((l) => l.van_spec.wheelbase === f.wheelbase);
  if (f.fuel) {
    const wants = csv(f.fuel).map(slugify);
    out = out.filter((l) => wants.includes(slugify(l.fuel)));
  }
  if (f.gearbox) out = out.filter((l) => l.transmission.toLowerCase() === f.gearbox!.toLowerCase());
  if (f.colour) out = out.filter((l) => l.colour !== "—" && slugify(l.colour) === slugify(f.colour!));
  if (f.maxMileage != null) out = out.filter((l) => l.mileage == null || l.mileage <= f.maxMileage!);
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

  // Distance filter: when buyer coords + radius are set, exclude listings
  // without coords and filter by haversine distance. Nationwide (no radius)
  // shows all listings regardless of whether they have coordinates.
  if (f.buyerLat != null && f.buyerLng != null && f.radius != null) {
    out = out.filter((l) => {
      if (l.location.lat == null || l.location.lng == null) return false;
      return haversineDistanceMiles(f.buyerLat!, f.buyerLng!, l.location.lat, l.location.lng) <= f.radius!;
    });
  }

  const effectiveSort = f.sort ?? (f.buyerLat != null ? "nearest" : "newest");

  // When multiple models are selected, pre-group results by model-array order
  // so the chip drag order maps to result order within each model group.
  if (f.models && f.models.length > 1) {
    const wants = f.models.map(slugify);
    out = [...out].sort((a, b) => {
      const ia = wants.findIndex(
        (w) => slugify(a.model) === w || resolveModelSlug(a.make, a.model)?.modelSlug === w,
      );
      const ib = wants.findIndex(
        (w) => slugify(b.model) === w || resolveModelSlug(b.make, b.model)?.modelSlug === w,
      );
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });
  }

  switch (effectiveSort) {
    case "nearest":
      if (f.buyerLat != null && f.buyerLng != null) {
        out = [...out].sort((a, b) => {
          const da = a.location.lat != null && a.location.lng != null
            ? haversineDistanceMiles(f.buyerLat!, f.buyerLng!, a.location.lat, a.location.lng)
            : Infinity;
          const db = b.location.lat != null && b.location.lng != null
            ? haversineDistanceMiles(f.buyerLat!, f.buyerLng!, b.location.lat, b.location.lng)
            : Infinity;
          return da - db;
        });
      }
      break;
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
  // Keep live feed stock ahead of demo/native listings within each status tier.
  out = [...out].sort((a, b) => sourceRank(a) - sourceRank(b));
  return out;
}

function statusRank(l: Listing): number {
  return l.status === "active" ? 0 : l.status === "reserved" ? 1 : 2;
}

// Live feed stock (dealski) sorts before demo/native listings.
function sourceRank(l: Listing): number {
  return l.source === "dealski" ? 0 : 1;
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

/** Native (database) listing ids are cuids. A slug ending in anything else (a Dealski number, a typo) can never be one, so it must not cost a database round trip. */
const NATIVE_ID = /^c[a-z0-9]{20,30}$/;

export const getListingBySlug = cache(getListingBySlugUncached);

async function getListingBySlugUncached(slug: string): Promise<{ listing: Listing | null; servedBy: ListingSource | "mock" }> {
  // A private seller's advert: resolved by its own prefix first, so its trailing number can never be mistaken for another source's id.
  if (slug.startsWith(PRIVATE_SLUG_PREFIX)) {
    return { listing: await fetchPrivateSellerListingBySlug(slug).catch(() => null), servedBy: "vansales" };
  }
  // A dealer-portal advert (vansales API): same idea, its own prefix.
  if (slug.startsWith(DEALER_SLUG_PREFIX)) {
    return { listing: await fetchDealerPortalListingBySlug(slug).catch(() => null), servedBy: "vansales" };
  }
  const source = configuredSource();
  const sourceId = sourceIdFromSlug(slug);

  // Always try native DB first (portal-added listings are always resolvable).
  const nativeListing = NATIVE_ID.test(sourceId)
    ? await withTimeout(fetchNativeDbListingById(sourceId), EXTRAS_BUDGET_MS, "native listing lookup").catch((e: Error) => {
        console.warn(`[listings] native lookup for ${sourceId} skipped: ${e.message}`);
        return null;
      })
    : null;
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

  const all = [...getMockListings(), ...demoListings()];
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
