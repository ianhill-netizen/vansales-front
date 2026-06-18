import type { Listing } from "./types";

/** Lowercase, hyphenate, strip anything that isn't a-z 0-9 or hyphen. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/**
 * Canonical listing slug: make-model-derivative-town-{source_id}.
 * The trailing source_id is the resolvable handle (see sourceIdFromSlug).
 */
export function buildSlug(parts: {
  make: string;
  model: string;
  derivative: string;
  town: string;
  source_id: string;
}): string {
  const head = [parts.make, parts.model, parts.derivative, parts.town]
    .map((p) => slugify(p || ""))
    .filter(Boolean)
    .join("-");
  return `${head}-${slugify(parts.source_id)}`;
}

/** Resolve the trailing source_id from a slug (everything after the last hyphen). */
export function sourceIdFromSlug(slug: string): string {
  const idx = slug.lastIndexOf("-");
  return idx === -1 ? slug : slug.slice(idx + 1);
}

/** make+model path segment for /vans/[make]/[model]. */
export function modelPath(make: string, model: string): string {
  return `/vans/${slugify(make)}/${slugify(model)}`;
}

export function listingPath(slugOrListing: string | Listing): string {
  const slug =
    typeof slugOrListing === "string" ? slugOrListing : slugOrListing.slug;
  return `/listing/${slug}`;
}
