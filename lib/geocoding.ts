/* =============================================================================
   NOMINATIM GEOCODING — server-side only, never called from the browser.
   Converts a town/address string to lat/lng using the free OSM Nominatim API.
   Results are cached for 30 days via Next.js Data Cache so each dealer town
   is only looked up once per deployment cycle.

   Usage policy:
   - Set a descriptive User-Agent (required by Nominatim ToS)
   - One request per address; rely on Next.js fetch cache for deduplication
   - Do NOT call from the browser — keep all Nominatim requests server-side
   ============================================================================= */

const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "Vansales.com/1.0 (dealer-location-map; hello@vansales.com)";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Geocode a town or address string to WGS-84 coordinates.
 * Returns null when Nominatim can't resolve the query — callers should
 * fall back to a hardcoded default rather than showing a broken map.
 *
 * The fetch is cached for 30 days; identical queries within that window
 * return the cached result without hitting Nominatim again.
 */
export async function geocodeTown(query: string): Promise<LatLng | null> {
  const url = `${NOMINATIM}?q=${encodeURIComponent(query + ", UK")}&format=json&limit=1&countrycodes=gb`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
      // Next.js Data Cache — 30-day revalidation.
      // This cache key is the URL, so each unique query is stored separately.
      next: { revalidate: THIRTY_DAYS },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!data?.[0]?.lat) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}
