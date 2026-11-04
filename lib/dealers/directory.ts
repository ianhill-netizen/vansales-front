import { DEALERS } from "@/lib/dealers/config";
import { getListings } from "@/lib/listings/client";
import { prisma } from "@/lib/prisma";

export interface DirectoryDealer {
  slug: string;
  name: string;
  town: string;
  county: string;
  vanCount: number;
  makes: string[]; // distinct makes in stock, most numerous first
  featured: boolean;
  rating: number | null;
}

/** Dealers that have a /dealer/[slug] page: the config entries (demo dealer only when SHOW_DEMO_LISTINGS) plus any Prisma dealer rows.
 *  Stock counts / makes come from the same catalogue the rest of the site uses, matched on seller name. */
export async function getDealerDirectory(): Promise<DirectoryDealer[]> {
  const showDemo = process.env.SHOW_DEMO_LISTINGS === "true";
  const [{ listings }, dbDealers] = await Promise.all([
    getListings({}),
    Promise.race([
      prisma.dealer.findMany({ select: { slug: true, name: true, location: true, googleRating: true } }),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("dealer lookup timed out")), 2500)),
    ]).catch((e: Error) => {
      console.warn(`[dealers] database dealers skipped: ${e.message}`);
      return [] as { slug: string; name: string; location: string | null; googleRating: number | null }[];
    }),
  ]);

  const stats = (names: string[]) => {
    const wanted = new Set(names.map((n) => n.toLowerCase()));
    const mine = listings.filter((l) => wanted.has(l.seller.name.toLowerCase()));
    const byMake = new Map<string, number>();
    for (const l of mine) byMake.set(l.make, (byMake.get(l.make) ?? 0) + 1);
    return { count: mine.length, makes: [...byMake.entries()].sort((a, b) => b[1] - a[1]).map(([m]) => m) };
  };

  const out: DirectoryDealer[] = [];
  for (const d of Object.values(DEALERS)) {
    if (!showDemo && d.sellerNames.some((n) => /acme/i.test(n))) continue;
    const s = stats([...d.sellerNames, d.dealskiTenant].filter(Boolean));
    out.push({ slug: d.slug, name: d.name, town: d.location.town, county: d.location.county, vanCount: s.count, makes: s.makes, featured: d.featured, rating: d.googleRating });
  }
  for (const d of dbDealers) {
    if (out.some((o) => o.slug === d.slug)) continue;
    const s = stats([d.name]);
    const [town = "", county = ""] = (d.location ?? "").split(",").map((x) => x.trim());
    out.push({ slug: d.slug, name: d.name, town, county, vanCount: s.count, makes: s.makes, featured: false, rating: d.googleRating });
  }
  return out.sort((a, b) => Number(b.featured) - Number(a.featured) || b.vanCount - a.vanCount || a.name.localeCompare(b.name));
}
