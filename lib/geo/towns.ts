/** The gazetteer: ~1,250 UK places of 10,000+ people (GeoNames, CC BY 4.0), built by scripts/build-places.py. Cities are flagged and served by their own page (tree.ts). */
import places from "./places.json";
import { miles } from "./stock.ts";

export interface Place { s: string; n: string; c: string; r: string; t: string; la: number; ln: number; p: number; city?: boolean }

export const PLACES = places as Place[];
export const TOWNS: readonly Place[] = PLACES.filter((p) => !p.city);
const townByKey = new Map(TOWNS.map((t) => [t.s, t]));
const placeByKey = new Map(PLACES.map((t) => [t.s, t]));

export const findTown = (key: string): Place | undefined => townByKey.get(key);
/** The gazetteer row for any key, city or town (a city's centre). */
export const findPlace = (key: string): Place | undefined => placeByKey.get(key);

/** The `n` closest other places (towns and cities) to this one. */
export function nearbyPlaces(of: Place, n: number): (Place & { miles: number })[] {
  return PLACES.filter((p) => p.s !== of.s)
    .map((p) => ({ ...p, miles: miles({ lat: of.la, lng: of.ln }, { lat: p.la, lng: p.ln }) }))
    .sort((a, b) => a.miles - b.miles)
    .slice(0, n);
}

/** The gazetteer place closest to a point (used to say which region / nation a van or dealer sits in). */
export function nearestPlace(lat: number, lng: number): Place {
  let best = PLACES[0], bd = Infinity;
  for (const p of PLACES) {
    const d = (p.la - lat) ** 2 + ((p.ln - lng) * Math.cos((lat * Math.PI) / 180)) ** 2;
    if (d < bd) { bd = d; best = p; }
  }
  return best;
}
