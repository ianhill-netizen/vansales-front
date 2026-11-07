/**
 * Where a removed (sold / expired / deleted) listing's URL should go. Pure, no I/O.
 * A listing URL is /listing/{slug}; once the van is gone the page used to 404 and the 1,000+ such URLs Google already knew were lost. Now the page answers with a permanent redirect (308) to the nearest live page:
 *   1. the model's buying-guide page   /used-vans/{make}/{model}-for-sale   (the 62 allowlisted models: the money pages)
 *   2. the make's stock page           /vans/{make}-vans-for-sale           (a known make, a model with no guide)
 *   3. /used-vans                                                           (nothing usable)
 * make and model come from the backend's last-known data when it has them (a sold dealer listing keeps its row), otherwise from the slug itself, which always starts with them
 * ("dealer-ford-transit-2019-10", "private-nissan-nv200-2011-1", "ford-transit-custom-320-l2-leeds-12345").
 */
import { ALL_MAKES, getMakeByName } from "../taxonomy/van-makes.ts";
import { USED_VAN_MODELS, slugify, usedVanPath } from "../used-vans/models.ts";
import { makeVansPath } from "../seo/make-url.ts";

export const GONE_FALLBACK = "/used-vans";

export interface RemovedHint {
  make?: string | null;
  model?: string | null;
}

/** Real listing slugs are lower-case words joined by hyphens and end in an id (numeric, or a cuid): anything else is a typo or junk and stays a 404. */
export function isListingSlug(slug: string): boolean {
  return slug.length <= 200 && /^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(slug) && /-[a-z0-9]*\d[a-z0-9]*$/.test(slug);
}

/** The slug as the backend knows it: the front adds "dealer-" / "private-" in front of it. */
export const backendSlug = (slug: string): string => slug.replace(/^(?:dealer|private)-/, "");

const MAKE_SLUGS = ALL_MAKES.map((m) => m.slug).sort((a, b) => b.length - a.length); // longest first: land-rover before land

/** The make slug a slug string starts with, and what is left after it. */
function splitSlug(raw: string): { makeSlug: string; rest: string } | null {
  const s = backendSlug(raw);
  for (const m of MAKE_SLUGS) if (s === m || s.startsWith(`${m}-`)) return { makeSlug: m, rest: s.slice(m.length + 1) };
  return null;
}

/** The longest allowlisted model of this make that `text` is, or starts with ("transit-custom-320-l2" -> transit-custom, not transit). */
function guideFor(makeSlug: string, text: string): string | null {
  const t = slugify(text);
  const hit = USED_VAN_MODELS.filter((m) => m.makeSlug === makeSlug && (t === m.modelSlug || t.startsWith(`${m.modelSlug}-`))).sort((a, b) => b.modelSlug.length - a.modelSlug.length)[0];
  return hit ? usedVanPath(hit) : null;
}

export function goneTarget(slug: string, hint?: RemovedHint | null): string {
  // 1. The backend's last-known make and model.
  if (hint?.make) {
    const make = getMakeByName(hint.make) ?? ALL_MAKES.find((m) => m.slug === slugify(hint.make!));
    if (make) return (hint.model ? guideFor(make.slug, hint.model) : null) ?? makeVansPath(make.slug);
  }
  // 2. The slug: its leading words are the make, the next ones the model.
  const parts = splitSlug(slug);
  if (parts) return guideFor(parts.makeSlug, parts.rest) ?? makeVansPath(parts.makeSlug);
  return GONE_FALLBACK;
}
