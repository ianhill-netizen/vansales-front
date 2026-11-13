/** Which vans / dealers belong to a place: great-circle distance from its centre, with the radius expanding when stock is thin, and the index rule. Pure, no I/O. */
import { GEO } from "./config.ts";

export interface Pt { lat: number | null; lng: number | null }

const R = 3958.8;
export function miles(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export interface InRange<T> { item: T; miles: number }

/** Items with coordinates inside `radius` miles of the centre, nearest first. */
export function within<T>(items: readonly T[], at: (t: T) => Pt, centre: { lat: number; lng: number }, radius: number): InRange<T>[] {
  const out: InRange<T>[] = [];
  for (const item of items) {
    const p = at(item);
    if (p.lat == null || p.lng == null) continue;
    const d = miles(centre, { lat: p.lat, lng: p.lng });
    if (d <= radius) out.push({ item, miles: d });
  }
  return out.sort((a, b) => a.miles - b.miles);
}

export interface PlaceStock<T> { radius: number; expanded: boolean; vans: InRange<T>[] }

/** Vans within the normal radius; within the expanded one when there are fewer than `expandBelow`. */
export function stockFor<T>(vans: readonly T[], at: (t: T) => Pt, centre: { lat: number; lng: number }, cfg: Pick<typeof GEO, "radiusMiles" | "expandedRadiusMiles" | "expandBelow"> = GEO): PlaceStock<T> {
  const near = within(vans, at, centre, cfg.radiusMiles);
  if (near.length >= cfg.expandBelow) return { radius: cfg.radiusMiles, expanded: false, vans: near };
  return { radius: cfg.expandedRadiusMiles, expanded: true, vans: within(vans, at, centre, cfg.expandedRadiusMiles) };
}

/** index,follow only with enough vans in range or a dealer in range. `vanCount` is the count within whichever radius was used. */
export function isIndexable(vanCount: number, dealersInRange: number, cfg: Pick<typeof GEO, "indexMinListings" | "indexMinDealers"> = GEO): boolean {
  return vanCount >= cfg.indexMinListings || dealersInRange >= cfg.indexMinDealers;
}
