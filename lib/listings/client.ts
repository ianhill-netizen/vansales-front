import type { Listing, ListingFilters, ListingResult, ListingSource } from "./types";
import { getMockListings } from "./sources/mock";
import { fetchDealskiListings, fetchDealskiBySourceId } from "./sources/dealski";
import { sourceIdFromSlug, slugify } from "./slug";

/* =============================================================================
   DATA LAYER  — the only module screens import.
   Source is chosen by env LISTINGS_SOURCE ('dealski' | 'native' | 'mock').
   The live source falls back to mock when the upstream is unreachable, and
   every result reports which source actually served it.
   ========================================================================== */

function configuredSource(): ListingSource | "mock" {
  const v = (process.env.LISTINGS_SOURCE || "mock").toLowerCase();
  if (v === "dealski" || v === "native") return v;
  return "mock";
}

/** Load the full candidate set from the active source, with fallback. */
async function loadAll(
  hint: { make?: string; model?: string } = {},
): Promise<{ listings: Listing[]; servedBy: ListingSource | "mock"; live: boolean }> {
  const source = configuredSource();

  if (source === "dealski") {
    try {
      const listings = await fetchDealskiListings(hint);
      if (listings.length > 0) return { listings, servedBy: "dealski", live: true };
      // Empty upstream → fall through to mock so the UI is never blank.
    } catch {
      /* fall through */
    }
    return { listings: getMockListings(), servedBy: "mock", live: false };
  }

  // 'native' and 'mock' are both served from the local fixtures in this repo.
  return { listings: getMockListings(), servedBy: source === "native" ? "native" : "mock", live: false };
}

function applyFilters(listings: Listing[], f: ListingFilters): Listing[] {
  let out = listings.filter((l) => l.status !== "removed");

  if (f.make) out = out.filter((l) => slugify(l.make) === slugify(f.make!));
  if (f.model) out = out.filter((l) => slugify(l.model) === slugify(f.model!));
  if (f.bodyStyle) out = out.filter((l) => slugify(l.van_spec.body_style) === slugify(f.bodyStyle!));
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
  const { listings, servedBy, live } = await loadAll({
    make: filters.make,
    model: filters.model,
  });
  const filtered = applyFilters(listings, filters);
  const limited = filters.limit ? filtered.slice(0, filters.limit) : filtered;
  return { listings: limited, total: filtered.length, servedBy, live };
}

export async function getListingBySlug(slug: string): Promise<{ listing: Listing | null; servedBy: ListingSource | "mock" }> {
  const source = configuredSource();
  const sourceId = sourceIdFromSlug(slug);

  if (source === "dealski") {
    const live = await fetchDealskiBySourceId(sourceId);
    if (live) return { listing: live, servedBy: "dealski" };
    // fall through to mock by slug/source_id
  }

  const all = getMockListings();
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
