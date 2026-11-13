import { parsePlacements, type Placement } from "@/lib/affiliates";

const BASE = (process.env.DEALSKI_API_URL ?? "https://swissvans.dealski.co.uk").replace(/\/$/, "");

/** The active placements for a page of this site, from Dealski. [] on any failure (an outage must never show or break a link). Cached 5 minutes. */
export async function getPlacements(page: string): Promise<Placement[]> {
  try {
    const res = await fetch(`${BASE}/api/public/affiliate-placements?tenant=swissvans&page=${encodeURIComponent(page)}`, { headers: { Accept: "application/json" }, next: { revalidate: 300 }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) return [];
    return parsePlacements(await res.json());
  } catch {
    return [];
  }
}
