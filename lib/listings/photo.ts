import type { Listing } from "./types";

/**
 * "No photo, no card." A listing with no real photo is never shown as a card in a grid, strip or carousel (homepage Latest vans, make / model / body-type / category pages,
 * dealer pages, related vans, the sitemap's stock-driven URLs). It still has its own page for anyone holding the URL.
 * One rule, used by the data layer (lib/listings/client.ts applyFilters) and by ListingCard itself, so the two can never disagree.
 */
export function hasCardPhoto(l: Pick<Listing, "images">): boolean {
  return l.images?.[0]?.url?.startsWith("http") === true;
}
