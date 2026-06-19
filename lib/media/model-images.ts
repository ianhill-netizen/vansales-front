import manifest from "../../scripts/model-images-manifest.json";

/** Normalise a catalogue make name ("Mercedes-Benz", "Citroën"…) to the slug used in public/media/. */
function makeToSlug(make: string): string {
  return make
    .toLowerCase()
    .replace(/ë/g, "e")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

type ManifestMap = Record<string, string[]>;
const MAP = manifest as ManifestMap;

/**
 * Return public paths for library images for a given make.
 * Returns [] when no images exist (orange SpecCard fallback applies).
 */
export function getModelImages(make: string): string[] {
  const slug = makeToSlug(make);
  return MAP[slug] ?? [];
}

/**
 * Pick one image from the model set, rotating by index.
 * Returns null when no images exist.
 */
export function getModelImage(make: string, index: number): string | null {
  const images = getModelImages(make);
  if (images.length === 0) return null;
  return images[index % images.length];
}
