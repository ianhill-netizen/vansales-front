/** One place's numbers, shared by its page and the sitemap so the index rule can never disagree with the robots meta. Pure. */
import { GEO } from "./config.ts";
import { isIndexable, stockFor, within, type InRange, type PlaceStock } from "./stock.ts";

export interface DealerPt { lat: number | null; lng: number | null }
export interface VanPt { location: { lat: number | null; lng: number | null } }

export interface PlaceSummary<V, D> {
  stock: PlaceStock<V>;
  /** Dealers inside the normal radius (never the expanded one), nearest first. */
  dealers: InRange<D>[];
  indexable: boolean;
}

export function summarisePlace<V extends VanPt, D extends DealerPt>(centre: { lat: number; lng: number }, vans: readonly V[], dealers: readonly D[]): PlaceSummary<V, D> {
  const stock = stockFor(vans, (v) => v.location, centre);
  // The index rule counts vans inside the radius that applied; dealers are counted inside the normal radius.
  const near = within(dealers, (d) => d, centre, GEO.radiusMiles);
  return { stock, dealers: near, indexable: isIndexable(stock.vans.length, near.length) };
}
