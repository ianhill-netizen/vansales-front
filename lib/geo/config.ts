/**
 * The knobs for the /vans-for-sale geography pages. Change them here as stock grows (tighten the index rule, shrink the radius); nothing else hard-codes them.
 */
export const GEO = {
  /** Stock and dealers are counted within this many miles of the place. */
  radiusMiles: 25,
  /** Used instead when fewer than `expandBelow` vans are inside `radiusMiles`. */
  expandedRadiusMiles: 50,
  expandBelow: 6,
  /** A town / city page is indexed (index,follow) with at least this many vans in range... */
  indexMinListings: 6,
  /** ...or at least this many dealers within `radiusMiles`. Otherwise noindex,follow with the canonical on the parent region page. */
  indexMinDealers: 1,
  /** Nearby towns shown on a town page. */
  nearbyTowns: 8,
  /** Vans shown on a page. */
  shownVans: 12,
} as const;
