/**
 * Where a dealer is: its town slug, the regional "vans for sale" page that covers it, its nearest neighbours, and whether its page is worth indexing. Pure, no I/O.
 */
import { LANDING_PAGES } from "../landing-pages.ts";
import { haversineDistanceMiles } from "../distance.ts";

export const townSlug = (town: string): string => town.normalize("NFD").replace(/\p{Mn}/gu, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** "Bridgend" for "bridgend" (towns come from postcode lookups, already in a sensible case; this only fixes an all-lower or all-upper town). */
export const townLabel = (town: string): string => (town === town.toLowerCase() || town === town.toUpperCase() ? town.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_m, a: string, b: string) => a + b.toUpperCase()) : town);

/** The leading letters of a UK postcode ("CF31 3AP" -> "CF"). */
export const postcodeArea = (postcode: string | null | undefined): string => (postcode ?? "").trim().toUpperCase().match(/^[A-Z]{1,2}/)?.[0] ?? "";

export interface RegionPage { path: string; name: string }

/** The /vans-for-sale/{region} page whose matching rule covers this town / county / postcode, or null. Uses the same `match` rules as the region pages themselves. */
export function regionPageFor(d: { town?: string | null; county?: string | null; postcode?: string | null }): RegionPage | null {
  const probe = { fuel: "", location: { town: d.town ?? "", region: d.county ?? "", postcode_area: postcodeArea(d.postcode) } };
  for (const p of LANDING_PAGES) {
    if (p.kind === "buying" && p.path.startsWith("/vans-for-sale/") && p.match?.(probe)) return { path: p.path, name: p.path.split("/").pop()!.replace(/^./, (c) => c.toUpperCase()) };
  }
  return null;
}

export interface Located { slug: string; lat: number | null; lng: number | null }

/** The `n` closest other dealers (by great-circle miles) that have coordinates. */
export function nearestDealers<T extends Located>(self: { slug: string; lat: number | null; lng: number | null }, all: readonly T[], n = 3): (T & { miles: number })[] {
  if (self.lat == null || self.lng == null) return [];
  return all
    .filter((d) => d.slug !== self.slug && d.lat != null && d.lng != null)
    .map((d) => ({ ...d, miles: haversineDistanceMiles(self.lat!, self.lng!, d.lat!, d.lng!) }))
    .sort((a, b) => a.miles - b.miles)
    .slice(0, n);
}

/** A dealer page is indexed when it has stock to show or an about text to read; otherwise noindex,follow. A configured dealer (Swiss Vans) is always indexed. */
export const dealerIndexable = (d: { stockCount: number; hasAbout: boolean; configured?: boolean }): boolean => d.configured === true || d.stockCount > 0 || d.hasAbout;

/** The description of a dealer page. The stock sentence is dropped when there is no stock; finance is mentioned only for a dealer that offers it (Swiss Vans, or one with its own finance link). */
export function dealerDescription(o: { name: string; town: string; county: string; stock: number; finance: boolean }): string {
  const town = o.town ? townLabel(o.town) : "";
  const where = [town, o.county && o.county.toLowerCase() !== town.toLowerCase() ? o.county : ""].filter(Boolean).join(", ");
  const tail = o.finance ? "compare prices, mileage and finance" : "compare prices and mileage";
  return `${o.name}, used van dealer${where ? ` in ${where}` : ""}. ${o.stock > 0 ? `${o.stock} van${o.stock === 1 ? "" : "s"} in stock on Vansales — ${tail}.` : `${tail[0].toUpperCase()}${tail.slice(1)} on Vansales.`}`;
}
