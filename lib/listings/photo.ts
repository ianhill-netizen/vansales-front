import type { Listing, ListingImage } from "./types";

/**
 * "No photo, no card." A listing with no real photo is never shown as a card in a grid, strip or carousel (homepage Latest vans, make / model / body-type / category pages,
 * dealer pages, related vans, counts, facets, the sitemap's stock-driven URLs). It still has its own page for anyone holding the URL.
 * One rule, used by the data layer (lib/listings/client.ts applyFilters) and by ListingCard itself, so the two can never disagree.
 *
 * "Real photo" is validity-based, not just "has a URL": a site's grey "no photo" picture is a perfectly valid 200 image/jpeg, so a status check alone passes it. Two layers:
 *  - here (pure, sync): the URL must be http(s) and must not look like a placeholder (woocommerce-placeholder, no-image, coming-soon ...);
 *  - lib/listings/image-check.ts (async, run once when the catalogue loads): the lead image must really answer 200 with an image/* body that is not placeholder-sized.
 *    The loader swaps in the first valid image or empties `images`, so this predicate stays synchronous.
 */
const PLACEHOLDER_URL = /woocommerce-placeholder|placeholder|no[-_]?image|coming[-_]?soon|image[-_]not[-_]available/i;

/** True when the URL (its path, not its query string) looks like a site's "no photo" stand-in. */
export function isPlaceholderImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  let path = url.replace(/[?#].*$/, "");
  try {
    path = decodeURIComponent(path);
  } catch {
    /* keep the raw path */
  }
  return PLACEHOLDER_URL.test(path);
}

export function hasCardPhoto(l: Pick<Listing, "images">): boolean {
  const url = l.images?.[0]?.url;
  return url?.startsWith("http") === true && !isPlaceholderImageUrl(url);
}

/** The images with every placeholder-looking one removed, order kept: a listing whose first image is a placeholder but has real photos behind it leads with the first real one. */
export function withoutPlaceholderImages(images: ListingImage[]): ListingImage[] {
  return (images ?? []).filter((i) => !isPlaceholderImageUrl(i.url));
}
