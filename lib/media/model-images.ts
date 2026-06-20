import rawManifest from "../../scripts/model-images-manifest.json";

export type ModelImage = { path: string; alt: string };

type ManifestShape = {
  by_slug: Record<string, ModelImage[]>;
  by_make: Record<string, ModelImage[]>;
};

const MANIFEST = rawManifest as ManifestShape;

// Catalogue make → slug used as key in by_make
const MAKE_OVERRIDES: Record<string, string> = {
  volkswagen: "vw",
  "mercedes-benz": "mercedes",
  citroën: "citroen",
};

// When a listing model name is a string-prefix of a sibling model name,
// the startsWith scan would bleed into sibling images. List the sibling
// prefixes to exclude so each model only gets its own source-page images.
// E.g. "ford-transit" starts with same chars as "ford-transit-custom" —
// without this, a Transit card shows Transit Custom / Connect / Courier photos.
const SIBLING_PREFIXES: Record<string, string[]> = {
  "ford-transit": [
    "ford-transit-custom",
    "ford-transit-connect",
    "ford-transit-courier",
  ],
};

// A handful of manifest slugs carry a non-standard prefix (e.g. seeded from
// a "new-" WP product page). Map the canonical model prefix to the manifest
// slug so the prefix scan can find images for those models.
const SLUG_REMAPS: Record<string, string> = {
  "vauxhall-movano": "new-vauxhall-movano",
};

function toMakeSlug(make: string): string {
  const n = make.toLowerCase().replace(/[^a-z0-9]/g, "");
  return MAKE_OVERRIDES[make.toLowerCase()] ?? n;
}

function toModelSlug(model: string): string {
  return model
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// For listings with make="Van" (two misassigned entries), extract the real make from model text
function resolveVanMake(model: string): string {
  const m = model.toLowerCase();
  if (m.includes("renault")) return "renault";
  if (m.includes("vauxhall")) return "vauxhall";
  return "van";
}

/** Images for an exact catalogue slug — for /new-vans/[slug] product pages. */
export function getSlugImages(slug: string): ModelImage[] {
  return MANIFEST.by_slug[slug] ?? [];
}

/**
 * Images matching make + model across all slug variants for that model.
 * E.g. make="Ford" model="Transit Custom" returns images from all
 * ford-transit-custom-* slugs combined (sport, lease, crew-cab, etc.).
 * Falls back to make-level images, then empty array.
 */
export function getMakeModelImages(make: string, model: string): ModelImage[] {
  const effectiveMake = make === "Van" ? resolveVanMake(model) : make;
  const ms = toMakeSlug(effectiveMake);

  // Strip leading "New " and redundant make name that sometimes appears in model strings
  const cleanModel = model
    .replace(/^new\s+/i, "")
    .replace(new RegExp(`^(renault|vauxhall|ford)\\s+`, "i"), "")
    .trim();
  const mslug = toModelSlug(cleanModel);
  const prefix = `${ms}-${mslug}`;

  const siblings = SIBLING_PREFIXES[prefix] ?? [];
  const seen = new Set<string>();
  const result: ModelImage[] = [];

  for (const [slug, imgs] of Object.entries(MANIFEST.by_slug)) {
    if (slug !== prefix && !slug.startsWith(prefix + "-")) continue;
    // Source-page identity: skip slugs that belong to a more-specific sibling model
    if (siblings.some((s) => slug === s || slug.startsWith(s + "-"))) continue;
    for (const img of imgs) {
      if (!seen.has(img.path)) {
        seen.add(img.path);
        result.push(img);
      }
    }
  }

  if (result.length > 0) return result;

  // Some models live under a non-standard manifest slug (e.g. "new-vauxhall-movano").
  // Fall back to the remapped slug before dropping to make-level images.
  const remapped = SLUG_REMAPS[prefix];
  if (remapped) {
    const imgs = MANIFEST.by_slug[remapped] ?? [];
    return [...new Map(imgs.map((i) => [i.path, i])).values()];
  }

  // Make-level fallback
  return MANIFEST.by_make[ms] ?? [];
}

/** One image for a listing card, rotating by index. Returns null when no images. */
export function getListingCardImage(
  make: string,
  model: string,
  index: number,
): ModelImage | null {
  const imgs = getMakeModelImages(make, model);
  if (imgs.length === 0) return null;
  return imgs[index % imgs.length];
}
