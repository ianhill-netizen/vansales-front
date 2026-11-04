import { getMakeBySlug, getModelBySlug } from "@/lib/taxonomy/van-makes";

/* =============================================================================
   COMPETITOR GROUPS — which vans a buyer cross-shops. Drives the "Similar vans
   for sale" links on every model page (a link network that mirrors how people
   actually compare vans). Entries are [makeSlug, modelSlug] and must exist in
   lib/taxonomy/van-makes.ts (anything that doesn't is dropped at runtime, so a
   typo can never produce a link to a page that doesn't exist).

   Proace Max is not in the taxonomy yet (Proace stands in for it in the large
   group); electric variants resolve to their petrol/diesel sibling below.
   ============================================================================= */

export type VanSize = "small" | "medium" | "large" | "pickup";
type Ref = readonly [make: string, model: string];

export const COMPETITOR_GROUPS: Record<VanSize, Ref[]> = {
  small: [
    ["citroen", "berlingo"], ["peugeot", "partner"], ["vauxhall", "combo-cargo"], ["volkswagen", "caddy-cargo"],
    ["ford", "transit-connect"], ["renault", "kangoo"], ["fiat", "doblo"], ["nissan", "nv200"], ["mercedes-benz", "citan"],
  ],
  medium: [
    ["ford", "transit-custom"], ["vauxhall", "vivaro"], ["renault", "trafic"], ["peugeot", "expert"], ["citroen", "dispatch"],
    ["toyota", "proace"], ["fiat", "talento"], ["mercedes-benz", "vito"], ["volkswagen", "transporter"], ["nissan", "primastar"],
  ],
  large: [
    ["ford", "transit"], ["vauxhall", "movano"], ["renault", "master"], ["peugeot", "boxer"], ["citroen", "relay"],
    ["fiat", "ducato"], ["mercedes-benz", "sprinter"], ["volkswagen", "crafter"], ["iveco", "daily"], ["nissan", "interstar"],
  ],
  pickup: [
    ["ford", "ranger"], ["toyota", "hilux"], ["mitsubishi", "l200"], ["nissan", "navara"], ["volkswagen", "amarok"],
    ["isuzu", "d-max"], ["ssangyong", "musso"],
  ],
};

/** Electric / variant models → the model they compete as. */
const ALIASES: Record<string, string> = {
  "ford/e-transit": "ford/transit",
  "ford/e-transit-custom": "ford/transit-custom",
  "ford/transit-courier": "ford/transit-connect",
  "volkswagen/caddy": "volkswagen/caddy-cargo",
  "volkswagen/id-buzz-cargo": "volkswagen/transporter",
  "mercedes-benz/esprinter": "mercedes-benz/sprinter",
  "mercedes-benz/evito": "mercedes-benz/vito",
  "mercedes-benz/ecitan": "mercedes-benz/citan",
  "vauxhall/vivaro-e": "vauxhall/vivaro",
  "vauxhall/movano-e": "vauxhall/movano",
  "vauxhall/combo-e-cargo": "vauxhall/combo-cargo",
  "renault/master-e-tech-electric": "renault/master",
  "renault/trafic-e-tech": "renault/trafic",
  "renault/kangoo-e-tech-electric": "renault/kangoo",
  "citroen/e-relay": "citroen/relay",
  "citroen/e-dispatch": "citroen/dispatch",
  "citroen/e-berlingo": "citroen/berlingo",
  "citroen/jumpy": "citroen/dispatch",
  "citroen/jumper": "citroen/relay",
  "peugeot/e-boxer": "peugeot/boxer",
  "peugeot/e-expert": "peugeot/expert",
  "peugeot/e-partner": "peugeot/partner",
  "toyota/proace-electric": "toyota/proace",
  "toyota/proace-city": "citroen/berlingo",
  "toyota/proace-city-electric": "citroen/berlingo",
  "nissan/townstar": "renault/kangoo",
  "nissan/e-nv200": "nissan/nv200",
  "nissan/nv300": "renault/trafic",
  "nissan/nv400": "renault/master",
  "fiat/e-ducato": "fiat/ducato",
  "fiat/e-doblo": "fiat/doblo",
  "fiat/scudo": "peugeot/expert",
  "fiat/e-scudo": "peugeot/expert",
  "iveco/edaily": "iveco/daily",
  "mercedes-benz/sprinter-e": "mercedes-benz/sprinter",
  "land-rover/defender-pickup": "ford/ranger",
};

const SIZE_ORDER: VanSize[] = ["small", "medium", "large"];

export interface Competitor { makeSlug: string; modelSlug: string; label: string; href: string }

function resolveRef([m, mod]: Ref): Competitor | null {
  const make = getMakeBySlug(m);
  const model = getModelBySlug(m, mod);
  if (!make || !model) return null;
  return { makeSlug: m, modelSlug: mod, label: `${make.name} ${model.name}`, href: `/vans/${m}/${mod}` };
}

function groupOf(makeSlug: string, modelSlug: string): { size: VanSize; key: string } | null {
  const key = ALIASES[`${makeSlug}/${modelSlug}`] ?? `${makeSlug}/${modelSlug}`;
  for (const size of Object.keys(COMPETITOR_GROUPS) as VanSize[]) {
    if (COMPETITOR_GROUPS[size].some(([a, b]) => `${a}/${b}` === key)) return { size, key };
  }
  return null;
}

/** Models a buyer of this one would also look at: the rest of its size group (other makes first) plus the two best-known vans one size up and down. */
export function getCompetitors(makeSlug: string, modelSlug: string, limit = 12): Competitor[] {
  const g = groupOf(makeSlug, modelSlug);
  if (!g) return [];
  const self = `${makeSlug}/${modelSlug}`;
  const out: Competitor[] = [];
  const seen = new Set<string>([self, g.key]);
  const push = (r: Ref) => {
    const k = `${r[0]}/${r[1]}`;
    if (seen.has(k)) return;
    const c = resolveRef(r);
    if (c) { seen.add(k); out.push(c); }
  };
  const sameGroup = COMPETITOR_GROUPS[g.size];
  for (const r of sameGroup) if (r[0] !== makeSlug) push(r);       // other makes first: the real alternatives
  for (const r of sameGroup) push(r);                               // then same-make siblings of the group
  const i = SIZE_ORDER.indexOf(g.size);
  for (const adj of [SIZE_ORDER[i - 1], SIZE_ORDER[i + 1]]) {
    if (adj) COMPETITOR_GROUPS[adj].slice(0, 2).forEach(push);
  }
  return out.slice(0, limit);
}

/** Every model in the groups, for tests / sitemap sanity checks. */
export function allCompetitorModels(): Competitor[] {
  return (Object.values(COMPETITOR_GROUPS).flat() as Ref[]).map(resolveRef).filter((c): c is Competitor => c !== null);
}
