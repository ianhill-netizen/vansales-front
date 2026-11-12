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
import { fetchNativeDbListings, fetchNativeDbListingById } from "./sources/db";
import { fetchPrivateSellerListings, fetchPrivateSellerListingBySlug, fetchDealerPortalListings, fetchDealerPortalListingBySlug, PRIVATE_SLUG_PREFIX, DEALER_SLUG_PREFIX } from "./sources/vansales";
import { sourceIdFromSlug, slugify } from "./slug";
import { chooseExtras, shouldSkipRetry, type Extras } from "./extras-guard";
import { resolveModelSlug } from "@/lib/models/image";
import { getDealerConfig } from "@/lib/dealers/config";
import { WHEELBASE_LABEL, titleCase } from "./format";
import { hasCardPhoto } from "./photo";

/* =============================================================================
   DATA LAYER  — the only module screens import.
   ALL live stock comes from vansales-backend (/api/public/listings): dealer
   adverts (every Dealski-synced dealer is imported there by vansales:sync-dealski,
   Swiss Vans included) and private sellers. There is no direct Dealski feed any
   more; reading it as well showed a synced van twice.
   Source is chosen by env LISTINGS_SOURCE:
     'mock' (default) / 'native' — fixtures, for local development
     anything else (e.g. 'marketplace', 'dealski', 'live') — the live vansales-backend feed only
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

/** Native (portal-added) listings + private sellers' adverts + vansales dealer portal adverts. Never throws.
 *  `degraded` is true when one of the two vansales-backend feeds failed (the legacy native database is optional and does not count): the listings are then partial, stale or empty, never "no stock".
 *  A degraded load is NOT cached (a cached empty answer was what flipped real makes to noindex and out of the sitemap); the last good catalogue is served instead (stale-on-error), and after a failure the
 *  API is left alone for RETRY_AFTER_FAILURE_MS so a rate-limited or struggling backend is not hit again by every request. */
let lastGoodExtras: Listing[] | null = null;
let lastFailedAt = 0;
let lastAttempt: Listing[] = [];

const loadExtrasCached = unstable_cache(
  async (): Promise<Listing[]> => {
    const t0 = Date.now();
    let degraded = false;
    const [native, priv, dealerAdverts] = await Promise.all([
      withTimeout(fetchNativeDbListings(), EXTRAS_BUDGET_MS, "native listings (database)").catch((e: Error) => {
        console.warn(`[listings] native listings skipped after ${Date.now() - t0}ms: ${e.message}`);
        return [] as Listing[];
      }),
      withTimeout(fetchPrivateSellerListings(), EXTRAS_BUDGET_MS * 2, "private sellers feed").catch((e: Error) => {
        degraded = true;
        console.warn(`[listings] private sellers' adverts failed after ${Date.now() - t0}ms: ${e.message}`);
        return [] as Listing[];
      }),
      withTimeout(fetchDealerPortalListings(), EXTRAS_BUDGET_MS * 2, "dealer portal adverts").catch((e: Error) => {
        degraded = true;
        console.warn(`[listings] dealer portal adverts failed after ${Date.now() - t0}ms: ${e.message}`);
        return [] as Listing[];
      }),
    ]);
    lastAttempt = [...native, ...priv, ...dealerAdverts];
    if (degraded) throw new Error("listing feeds degraded"); // a thrown run is not stored by unstable_cache
    return lastAttempt;
  },
  ["listing-extras-v3"],
  { revalidate: 60, tags: ["listing-extras"] },
);

async function loadExtras(): Promise<Extras<Listing>> {
  if (shouldSkipRetry(lastFailedAt, Date.now()) && lastGoodExtras) return { listings: lastGoodExtras, degraded: true };
  try {
    const listings = await loadExtrasCached();
    lastGoodExtras = listings;
    lastFailedAt = 0;
    return { listings, degraded: false };
  } catch {
    lastFailedAt = Date.now();
    return chooseExtras({ listings: lastAttempt, degraded: true }, lastGoodExtras);
  }
}

/** The ACME Road Runner fixtures are for previewing the multi-dealer layout only. They never reach public responses unless SHOW_DEMO_LISTINGS=true (the data stays in the repo). */
function demoListings(): Listing[] {
  return process.env.SHOW_DEMO_LISTINGS === "true" ? getAcmeDemoListings() : [];
}

function configuredSource(): "mock" | "native" | "live" {
  const v = (process.env.LISTINGS_SOURCE || "mock").toLowerCase();
  if (v === "mock" || v === "native") return v;
  return "live"; // "marketplace" / "dealski" (the old direct-feed values) now mean the same: the vansales-backend feed
}

/** Load the ENTIRE catalogue from the active source (cached), with fallback.
 *  Native DB listings are always merged on top of the configured source. */
async function loadAllUncached(): Promise<{
  listings: Listing[];
  servedBy: ListingSource | "mock";
  live: boolean;
  feedTotal: number;
  /** a vansales-backend feed failed: the catalogue is partial/stale, so a zero must not be read as "no stock" */
  degraded: boolean;
}> {
  const source = configuredSource();

  // Native listings + private sellers' adverts start NOW, in parallel with the main feed below, and are awaited only when merging.
  const extrasP = loadExtras().catch((): Extras<Listing> => ({ listings: [], degraded: true }));

  // Demo dealer listings are opt-in (SHOW_DEMO_LISTINGS) and off in production.
  const demo = demoListings();

  if (source === "live") {
    // Real stock only: an empty catalogue is an honest answer, never a reason to show fixture vans.
    const extras = await extrasP;
    const merged = [...extras.listings, ...demo];
    return { listings: merged, servedBy: "vansales", live: true, feedTotal: merged.length, degraded: extras.degraded };
  }

  // 'native' and 'mock' modes.
  const mock = getMockListings();
  const extras = await extrasP;
  const merged = [...mock, ...extras.listings, ...demo];
  return {
    listings: merged,
    servedBy: source === "native" ? "native" : "mock",
    live: false,
    feedTotal: merged.length,
    degraded: extras.degraded,
  };
}


/** One catalogue load per request: getListings() and getFacets() on the same page share it. */
const loadAll = cache(loadAllUncached);

/** True when a live feed failed for this request's catalogue (shares the per-request load with getListings): pages must not treat an empty make/model as "no stock" then. */
export async function isCatalogueDegraded(): Promise<boolean> {
  return (await loadAll()).degraded;
}

const csv = (v: string) => v.split(",").map((s) => s.trim()).filter(Boolean);

function applyFilters(listings: Listing[], f: ListingFilters): Listing[] {
  // "No photo, no card": every grid, strip, carousel, facet and count is built from this list, so a listing with no photo appears in none of them (its own page still renders, it is looked up by slug).
  let out = listings.filter((l) => l.status !== "removed" && hasCardPhoto(l));

  if (f.dealer) {
    // Same match the dealer page uses: the API dealer slug, or (configured dealers) the seller names.
    const names = new Set((getDealerConfig(f.dealer)?.sellerNames ?? []).map((n) => n.toLowerCase()));
    out = out.filter((l) => l.dealer_contact?.slug === f.dealer || names.has(l.seller.name.toLowerCase()));
  }
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

// Dealers' stock sorts before private and demo/native listings.
function sourceRank(l: Listing): number {
  return l.seller_type === "dealer" ? 0 : 1;
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
  // A dealer portal advert (vansales API): same idea, its own prefix.
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

  // Live: every real listing has a "dealer-" / "private-" slug (handled above); anything else is not a listing.
  if (source === "live") return { listing: null, servedBy: "vansales" };

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
