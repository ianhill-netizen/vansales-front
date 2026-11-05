import { DEALERS } from "@/lib/dealers/config";
import { getListings } from "@/lib/listings/client";
import { prisma } from "@/lib/prisma";
import { geocodeTown } from "@/lib/geocoding";
import { safeDb } from "@/lib/db-safe";
import { fetchApiDealers } from "@/lib/dealers/api";

export interface DirectoryDealer {
  slug: string;
  name: string;
  town: string;
  county: string;
  vanCount: number;
  makes: string[]; // distinct makes in stock, most numerous first
  featured: boolean;
  rating: number | null;
  logoUrl?: string | null;
  lat: number | null;
  lng: number | null;
}

/** Dealers that have a /dealer/[slug] page: the config entries (demo dealer only when SHOW_DEMO_LISTINGS) plus any Prisma dealer rows.
 *  Stock counts / makes come from the same catalogue the rest of the site uses, matched on seller name. */
export async function getDealerDirectory(): Promise<DirectoryDealer[]> {
  const showDemo = process.env.SHOW_DEMO_LISTINGS === "true";
  const [{ listings }, dbDealers, apiDealers] = await Promise.all([
    getListings({}),
    safeDb(
      "directory dealers",
      () => prisma.dealer.findMany({ select: { slug: true, name: true, location: true, googleRating: true, lat: true, lng: true } }),
      [] as { slug: string; name: string; location: string | null; googleRating: number | null; lat: number | null; lng: number | null }[],
    ),
    fetchApiDealers(), // bounded and fail-safe: [] when the API is down
  ]);

  const apiBySlug = new Map(apiDealers.map((a) => [a.slug, a]));

  // Stock for a dealer = its adverts in the catalogue, matched by the API dealer slug (what the listing grid and the dealer page use) or, for older sources, the seller name.
  const stats = (names: string[], slug?: string) => {
    const wanted = new Set(names.map((n) => n.toLowerCase()));
    const mine = listings.filter((l) => (slug != null && l.dealer_contact?.slug === slug) || wanted.has(l.seller.name.toLowerCase()));
    const byMake = new Map<string, number>();
    for (const l of mine) byMake.set(l.make, (byMake.get(l.make) ?? 0) + 1);
    const at = mine.find((l) => l.location.lat != null && l.location.lng != null);
    return {
      count: mine.length,
      makes: [...byMake.entries()].sort((a, b) => b[1] - a[1]).map(([m]) => m),
      lat: at?.location.lat ?? null,
      lng: at?.location.lng ?? null,
    };
  };

  const out: DirectoryDealer[] = [];
  for (const d of Object.values(DEALERS)) {
    if (!showDemo && d.sellerNames.some((n) => /acme/i.test(n))) continue;
    const s = stats([...d.sellerNames, d.dealskiTenant].filter(Boolean), d.slug);
    const api = apiBySlug.get(d.slug);
    out.push({ slug: d.slug, name: d.name, town: d.location.town, county: d.location.county, vanCount: Math.max(s.count, api?.stock_count ?? 0), makes: s.makes, featured: d.featured, rating: d.googleRating, logoUrl: api?.logo_url ?? null, lat: s.lat, lng: s.lng });
  }
  for (const d of dbDealers) {
    if (out.some((o) => o.slug === d.slug)) continue;
    const s = stats([d.name], d.slug);
    const [town = "", county = ""] = (d.location ?? "").split(",").map((x) => x.trim());
    out.push({ slug: d.slug, name: d.name, town, county, vanCount: s.count, makes: s.makes, featured: false, rating: d.googleRating, logoUrl: apiBySlug.get(d.slug)?.logo_url ?? null, lat: d.lat ?? s.lat, lng: d.lng ?? s.lng });
  }
  // Dealers from the vansales API (dealer portal): de-duplicated by slug against the config and database dealers above. Their stock is the dealer-portal adverts in the catalogue.
  for (const d of apiDealers) {
    if (out.some((o) => o.slug === d.slug)) continue;
    const mine = listings.filter((l) => l.dealer_contact?.slug === d.slug);
    const byMake = new Map<string, number>();
    for (const l of mine) byMake.set(l.make, (byMake.get(l.make) ?? 0) + 1);
    const at = mine.find((l) => l.location.lat != null && l.location.lng != null);
    out.push({
      slug: d.slug, name: d.name, town: d.town ?? "", county: d.county ?? "",
      vanCount: Math.max(d.stock_count ?? 0, mine.length),
      makes: [...byMake.entries()].sort((a, b) => b[1] - a[1]).map(([m]) => m),
      featured: false, rating: null, logoUrl: d.logo_url, lat: at?.location.lat ?? null, lng: at?.location.lng ?? null,
    });
  }
  // Dealers whose stock carries no coordinates are placed by their postcode / town (30-day cached, bounded).
  await Promise.all(
    out.filter((d) => d.lat == null && (d.town || d.county)).map(async (d) => {
      const cfg = DEALERS[d.slug];
      const g = await safeDb("directory geocode", () => geocodeTown(cfg?.location.postcode || [d.town, d.county].filter(Boolean).join(", ")), null, 3500);
      if (g) { d.lat = g.lat; d.lng = g.lng; }
    }),
  );
  return out.sort((a, b) => Number(b.featured) - Number(a.featured) || b.vanCount - a.vanCount || a.name.localeCompare(b.name));
}
