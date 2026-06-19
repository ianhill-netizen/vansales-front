import { MODEL_CONTENT } from "./content.generated";
import { MODEL_IMAGE_SETS } from "./images.generated";
export type { ModelImage } from "./images.generated";
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

/** Get the full curated image set for a model, or null if none exists. */
export function modelImageSet(makeSlug: string, modelSlug: string) {
  return MODEL_IMAGE_SETS[`${makeSlug}/${modelSlug}`] ?? null;
}

/**
 * Primary hero image src for a listing's make+model.
 * Prefers a real cover photo over studio cutouts.
 * Returns null when no set exists — caller falls back to the SVG renderer.
 */
export function listingModelImage(listing: Pick<Listing, "make" | "model">): string | null {
  const resolved = resolveModelSlug(listing.make, listing.model);
  if (!resolved) return null;
  const set = modelImageSet(resolved.makeSlug, resolved.modelSlug);
  if (!set?.length) return null;
  const cover = set.find((img) => img.fit === "cover") ?? set[0];
  return cover.src;
}

/**
 * Model image for a listing card at position `cardIndex` in a grid.
 * Cycles through cover photos so a 24-card grid shows varied imagery
 * rather than the same hero photo repeated on every card.
 */
export function cardModelImage(
  listing: Pick<Listing, "make" | "model">,
  cardIndex: number,
): { src: string; alt: string; fit: "cover" | "contain" } | null {
  const resolved = resolveModelSlug(listing.make, listing.model);
  if (!resolved) return null;
  const set = modelImageSet(resolved.makeSlug, resolved.modelSlug);
  if (!set?.length) return null;
  const covers = set.filter((img) => img.fit === "cover");
  const pool = covers.length > 0 ? covers : set;
  const img = pool[cardIndex % pool.length];
  return { src: img.src, alt: img.alt, fit: img.fit };
}
