import { resolveModelSlug, modelImageSet } from "@/lib/models/image";

export type ModelImage = { path: string; alt: string };

export function getMakeModelImages(make: string, model: string): ModelImage[] {
  const resolved = resolveModelSlug(make, model);
  if (!resolved) return [];
  const set = modelImageSet(resolved.makeSlug, resolved.modelSlug);
  if (!set?.length) return [];
  return set.map((img) => ({ path: img.src, alt: img.alt }));
}

export function getListingCardImage(
  make: string,
  model: string,
  index: number,
): ModelImage | null {
  const resolved = resolveModelSlug(make, model);
  if (!resolved) return null;
  const set = modelImageSet(resolved.makeSlug, resolved.modelSlug);
  if (!set?.length) return null;
  const covers = set.filter((img) => img.fit === "cover");
  const pool = covers.length > 0 ? covers : set;
  return { path: pool[index % pool.length].src, alt: pool[index % pool.length].alt };
}

/** Resolve by exact "make/model" slug — e.g. for /new-vans/[slug] pages. */
export function getSlugImages(slug: string): ModelImage[] {
  const set = modelImageSet(slug.split("/")[0], slug.split("/")[1] ?? "");
  if (!set?.length) return [];
  return set.map((img) => ({ path: img.src, alt: img.alt }));
}
