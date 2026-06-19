import { MODEL_CONTENT, modelImage } from "./content.generated";
import { slugify } from "@/lib/listings/slug";
import type { Listing } from "@/lib/listings/types";

/* Index of makeSlug → known modelSlugs (longest first), built once. The live
   Dealski feed reports verbose per-vehicle model strings (e.g. "Transit Custom
   320 L2 Diesel FWD"), so we resolve them to a base model by longest match. */
const MODELS_BY_MAKE: Record<string, string[]> = (() => {
  const idx: Record<string, string[]> = {};
  for (const c of Object.values(MODEL_CONTENT)) {
    (idx[c.makeSlug] ||= []).push(c.modelSlug);
  }
  for (const k of Object.keys(idx)) idx[k].sort((a, b) => b.length - a.length);
  return idx;
})();

/** Resolve a listing's verbose make/model to a known base model slug, or null. */
export function resolveModelSlug(make: string, model: string): { makeSlug: string; modelSlug: string } | null {
  const makeSlug = slugify(make);
  const want = slugify(model);
  const known = MODELS_BY_MAKE[makeSlug];
  if (!known) return null;
  if (known.includes(want)) return { makeSlug, modelSlug: want };
  // longest known model that the verbose string starts with, then contains
  const starts = known.find((m) => want.startsWith(`${m}-`) || want === m);
  if (starts) return { makeSlug, modelSlug: starts };
  const contains = known.find((m) => want.includes(m));
  if (contains) return { makeSlug, modelSlug: contains };
  return null;
}

/**
 * Resolve a harvested MODEL-level hero image for a listing's make+model.
 * Inventory image fallback when the live feed has no per-vehicle photo.
 * Returns null when no model image exists (caller falls back to the SVG renderer).
 */
export function listingModelImage(listing: Pick<Listing, "make" | "model">): string | null {
  const resolved = resolveModelSlug(listing.make, listing.model);
  if (!resolved) return null;
  return modelImage(resolved.makeSlug, resolved.modelSlug);
}
