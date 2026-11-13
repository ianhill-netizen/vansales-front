/**
 * Legacy WordPress URL families -> the nearest live page. Pure (no I/O, no Node APIs), so proxy.ts can run it at the edge.
 *   /product-category/{type}   -> /used-vans/body-type/{slug}-for-sale when {type} names a body type, else the make page, else /vans
 *   /product/{listing}         -> /used-vans/{make}/{model}-for-sale for the make+model named in the slug, else the make page, else the body type, else /vans
 *   /van/{slug}                -> same as /product/{listing}
 * The explicit overrides (the /new-vans list, /about-us, root-level blog slugs, /detail/{n}) live in lib/redirects/all.ts and win over this because next.config redirects run before the proxy.
 * Anything that is not one of these families is not touched: it stays a 404.
 */
import { USED_VAN_MODELS, usedVanPath } from "../used-vans/models.ts";
import { BODY_TYPE_PAGES, bodyTypePath } from "../used-vans/body-types.ts";
import { ALL_MAKES } from "../taxonomy/van-makes.ts";

export interface LegacyHit { to: string; rule: string }

const BODY_ALIASES: Record<string, string> = {
  "crew-cab": "crew-van", "crew-vans": "crew-van", "crew-cab-vans": "crew-van", "double-cab": "crew-van", "doublecab": "crew-van", "kombi-crew": "crew-van",
  "luton-vans": "luton", "luton-van": "luton", "box-van": "luton", "box-vans": "luton",
  "tippers": "tipper", "tipper-vans": "tipper", "tipper-van": "tipper",
  "dropsides": "dropside", "dropside-vans": "dropside", "dropside-van": "dropside",
  "pickups": "pickup", "pick-up": "pickup", "pick-ups": "pickup", "pickup-trucks": "pickup", "pickup-truck": "pickup",
  "minibuses": "minibus", "mini-bus": "minibus", "minibus-hire": "minibus",
  "chassis-cabs": "chassis-cab", "chassis": "chassis-cab",
  "panel-vans": "panel-van", "panel": "panel-van",
  "tail-lift-vans": "tail-lift", "tail-lifts": "tail-lift", "tail-lift": "tail-lift",
  "4x4-vans": "4x4", "4x4": "4x4", "refrigerated-vans": "refrigerated", "fridge-vans": "refrigerated", "curtain-side-vans": "curtain-side", "curtainside": "curtain-side",
};
const BODY_SLUGS = new Set(BODY_TYPE_PAGES.map((b) => b.slug));
const BODY_WORDS: [RegExp, string][] = [
  [/(?:^|-)(?:luton|box-van)(?:-|$)/, "luton"], [/(?:^|-)tipper(?:s)?(?:-|$)/, "tipper"], [/(?:^|-)drop-?side(?:s)?(?:-|$)/, "dropside"], [/(?:^|-)(?:crew-?cab|double-?cab|crew-van)(?:-|$)/, "crew-van"],
  [/(?:^|-)pick-?up(?:s)?(?:-|$)/, "pickup"], [/(?:^|-)mini-?bus(?:es)?(?:-|$)/, "minibus"], [/(?:^|-)chassis-?cab(?:s)?(?:-|$)/, "chassis-cab"], [/(?:^|-)panel-van(?:s)?(?:-|$)/, "panel-van"],
  [/(?:^|-)tail-?lift(?:-|$)/, "tail-lift"], [/(?:^|-)4x4(?:-|$)/, "4x4"], [/(?:^|-)(?:refrigerated|fridge)(?:-|$)/, "refrigerated"], [/(?:^|-)curtain-?side(?:-|$)/, "curtain-side"],
];

/** "vw-transporter-t6" -> "volkswagen-transporter-t6"; "mercedes-sprinter" -> "mercedes-benz-sprinter". */
function normaliseMake(slug: string): string {
  return slug.replace(/^vw-/, "volkswagen-").replace(/^merc(?:edes)?-(?!benz)/, "mercedes-benz-").replace(/^mb-/, "mercedes-benz-").replace(/^citro-n-/, "citroen-");
}

function bodyTypeOf(slug: string): string | null {
  if (BODY_SLUGS.has(slug)) return slug;
  if (BODY_ALIASES[slug]) return BODY_ALIASES[slug];
  for (const [re, t] of BODY_WORDS) if (re.test(slug)) return t;
  return null;
}

const MODELS_LONGEST_FIRST = [...USED_VAN_MODELS].sort((a, b) => (b.makeSlug + b.modelSlug).length - (a.makeSlug + a.modelSlug).length);
const MAKES_LONGEST_FIRST = [...ALL_MAKES].map((m) => m.slug).sort((a, b) => b.length - a.length);

function modelOf(slug: string) {
  const s = normaliseMake(slug);
  return MODELS_LONGEST_FIRST.find((m) => s === `${m.makeSlug}-${m.modelSlug}` || s.startsWith(`${m.makeSlug}-${m.modelSlug}-`) || s.includes(`-${m.makeSlug}-${m.modelSlug}-`) || s.endsWith(`-${m.makeSlug}-${m.modelSlug}`));
}
function makeOf(slug: string): string | null {
  const s = normaliseMake(slug);
  return MAKES_LONGEST_FIRST.find((m) => s === m || s.startsWith(`${m}-`) || s.includes(`-${m}-`) || s.endsWith(`-${m}`)) ?? null;
}

const FAMILIES = [["product-category", "category"], ["product", "item"], ["van", "item"]] as const;

/** null = not a legacy family (leave the request alone). */
export function resolveLegacy(pathname: string): LegacyHit | null {
  const parts = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  if (parts.length === 0) return null;
  const fam = FAMILIES.find(([prefix]) => prefix === parts[0]);
  if (!fam) return null;
  const kind = fam[1];
  const slug = decodeURIComponent(parts[parts.length - 1] ?? "").toLowerCase().replace(/[^a-z0-9-]+/g, "-");
  const rule = `/${fam[0]}/*`;
  if (parts.length === 1) return { to: "/vans", rule: `${rule} index` };

  if (kind === "category") {
    const t = bodyTypeOf(slug);
    if (t) { const b = BODY_TYPE_PAGES.find((x) => x.slug === t)!; return { to: bodyTypePath(b), rule: `${rule} body type` }; }
    const mk = makeOf(slug);
    if (mk) return { to: `/vans/${mk}-vans-for-sale`, rule: `${rule} make` };
    return { to: "/vans", rule: `${rule} fallback` };
  }
  const m = modelOf(slug);
  if (m) return { to: usedVanPath(m), rule: `${rule} make+model` };
  const mk = makeOf(slug);
  if (mk) return { to: `/vans/${mk}-vans-for-sale`, rule: `${rule} make` };
  const t = bodyTypeOf(slug);
  if (t) { const b = BODY_TYPE_PAGES.find((x) => x.slug === t)!; return { to: bodyTypePath(b), rule: `${rule} body type` }; }
  return { to: "/vans", rule: `${rule} fallback` };
}
