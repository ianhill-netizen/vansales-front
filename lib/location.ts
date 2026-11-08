"use client";

/** The buyer's search location: a UK postcode (validated), its coordinates and town, and the radius in miles ("national" = no limit). The last one used is remembered in this browser (vansales:loc) so the search box is pre-filled on return. */
const API = (process.env.NEXT_PUBLIC_VANSALES_API_URL || "https://api.vansales.com").replace(/\/$/, "");
const KEY = "vansales:loc";

export const RADII = ["10", "25", "50", "100", "national"] as const;
export type Radius = (typeof RADII)[number];
export const DEFAULT_RADIUS: Radius = "25";
export const radiusLabel = (r: string) => (r === "national" ? "National" : `${r} miles`);

export interface Place { postcode: string; town: string; lat: number; lng: number }
export interface SavedLoc { postcode: string; town?: string; lat?: number; lng?: number; radius: Radius }

const UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
export const isUkPostcode = (v: string) => UK_POSTCODE.test(v.trim());
/** "cf313sn" -> "CF31 3SN". */
export const formatPostcode = (v: string) => { const p = v.replace(/\s+/g, "").toUpperCase(); return p.length > 3 ? `${p.slice(0, -3)} ${p.slice(-3)}` : p; };

export function readLoc(): SavedLoc | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null") as SavedLoc | null;
    if (!v || typeof v.postcode !== "string" || !isUkPostcode(v.postcode)) return null;
    return { ...v, radius: (RADII as readonly string[]).includes(v.radius) ? v.radius : DEFAULT_RADIUS };
  } catch { return null; }
}
export function saveLoc(l: SavedLoc): void { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch {} }

/** A postcode to its coordinates and town through our API (postcodes.io behind it). Throws a message fit to show. */
export async function lookupPostcode(postcode: string): Promise<Place> {
  const res = await fetch(`${API}/api/public/postcode/${encodeURIComponent(formatPostcode(postcode))}`, { headers: { Accept: "application/json" } }).catch(() => null);
  const body = res ? ((await res.json().catch(() => ({}))) as { data?: Place; message?: string }) : {};
  if (res?.ok && body.data) return body.data;
  throw new Error(res && res.status === 404 ? "We could not find that postcode." : res && res.status === 422 ? "Enter a full UK postcode, like CF31 1DW." : "We could not check that postcode just now. Please try again.");
}

/** "Near me": the nearest postcode to the device's position. */
export async function reverseLookup(lat: number, lng: number): Promise<Place> {
  const res = await fetch(`${API}/api/public/postcode/reverse?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}`, { headers: { Accept: "application/json" } }).catch(() => null);
  const body = res ? ((await res.json().catch(() => ({}))) as { data?: { postcode: string; town: string; lat: number; lng: number }; message?: string }) : {};
  if (res?.ok && body.data) return { postcode: body.data.postcode, town: body.data.town, lat: body.data.lat, lng: body.data.lng };
  throw new Error("We could not work out a postcode for your location. Type one instead.");
}

/** The /vans query for a place and radius (merged into any existing params by the caller). */
export function locationParams(p: Place, radius: Radius): Record<string, string> {
  return { postcode: p.postcode, lat: p.lat.toFixed(4), lng: p.lng.toFixed(4), loc: p.town, radius };
}
