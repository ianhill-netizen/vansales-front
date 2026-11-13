/** Server-side inputs for the geography pages: the active catalogue and the dealer directory. Either failing degrades to "none" so a page still renders (a throttled feed must not 500 a crawler). */
import { getListings } from "@/lib/listings/client";
import { getDealerDirectory, type DirectoryDealer } from "@/lib/dealers/directory";
import type { Listing } from "@/lib/listings/types";
import { dealerIndexable } from "@/lib/dealers/places";

export interface GeoInputs { vans: Listing[]; dealers: DirectoryDealer[] }

export async function loadGeoInputs(): Promise<GeoInputs> {
  const [vans, dealers] = await Promise.all([
    getListings({ status: "active" }).then((r) => r.listings).catch(() => [] as Listing[]),
    getDealerDirectory().catch(() => [] as DirectoryDealer[]),
  ]);
  // Only dealers whose own page is indexed count as "a dealer in range".
  return { vans, dealers: dealers.filter((d) => dealerIndexable({ stockCount: d.vanCount, hasAbout: d.hasAbout, configured: d.configured })) };
}

/** The most common body styles among these vans, most numerous first. */
export function topBodyStyles(vans: readonly Listing[], n = 3): string[] {
  const c = new Map<string, number>();
  for (const v of vans) { const b = v.van_spec.body_style?.trim(); if (b) c.set(b, (c.get(b) ?? 0) + 1); }
  return [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([b]) => b);
}
