/**
 * Where the old stock-driven /vans/{category} and /vans/{make}/{model} pages live now (Ian, 2026-11-13: /used-vans is canonical for body types and models; make pages stay at /vans/{make}-vans-for-sale).
 * Every internal link to a body type or model goes through these, so no page links to a URL that then redirects. Pure: no I/O.
 */
import { BODY_TYPE_PAGES, bodyTypePath } from "./body-types.ts";
import { findUsedVanModel, usedVanPath } from "./models.ts";

/** /vans/{slug} for the categories that stay (ulez, used, new), the body-type page for the eight that moved, /electric-vans for electric. */
export function categoryPath(slug: string): string {
  if (slug === "electric") return "/electric-vans";
  const b = BODY_TYPE_PAGES.find((x) => x.slug === slug);
  return b ? bodyTypePath(b) : `/vans/${slug}`;
}

/** The model's /used-vans page when it has one; otherwise the stock page /vans/{make}/{model}. */
export function modelPagePath(makeSlug: string, modelSlug: string): string {
  const m = findUsedVanModel(makeSlug, modelSlug);
  return m ? usedVanPath(m) : `/vans/${makeSlug}/${modelSlug}`;
}

/** The slugs of the body-type pages that replaced a /vans/{category} page. */
export const MOVED_CATEGORY_SLUGS: readonly string[] = ["panel-van", "luton", "tipper", "dropside", "crew-van", "pickup", "minibus", "chassis-cab"].filter((s) => BODY_TYPE_PAGES.some((b) => b.slug === s));

/** A redirect destination that points at an old stock URL is rewritten to where that page lives now, so no redirect ever chains into another one. */
export function canonicalDestination(d: string): string {
  const cat = /^\/vans\/([a-z0-9-]+)$/.exec(d);
  if (cat && MOVED_CATEGORY_SLUGS.includes(cat[1])) return categoryPath(cat[1]);
  const mod = /^\/vans\/([a-z0-9-]+)\/([a-z0-9-]+)$/.exec(d);
  return mod ? modelPagePath(mod[1], mod[2]) : d;
}

/** The searchable /vans view of one model (chip filter), for "search and filter all stock" links. */
export const modelStockHref = (makeSlug: string, modelSlug: string) => `/vans?v=${makeSlug}:${modelSlug}`;
