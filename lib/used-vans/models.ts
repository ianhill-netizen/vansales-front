/**
 * The /used-vans model pages: the 31 used-van models of vansales-seo-research.xlsx (Model Pages sheet: the top 20 by priority score, 2026-11-05, plus the other 11 rows added 2026-11-06). Pure data and slug rules, no I/O.
 * Each model's editorial page lives in vansales-backend's content_pages as page_type make_model under the content agent's slug `{make}-{model}-vans-for-sale`.
 */
export interface UsedVanModel {
  make: string;
  model: string;
  makeSlug: string;
  modelSlug: string;
  /** content_pages.slug of the editorial page. */
  pageSlug: string;
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const RAW: ReadonlyArray<readonly [string, string]> = [
  ["Ford", "Ranger"], ["Ford", "Transit"], ["Land Rover", "Defender"], ["Volkswagen", "Caddy"], ["Toyota", "Hilux"], ["Ford", "Transit Custom"], ["Renault", "Trafic"], ["Nissan", "Navara"], ["Ford", "Transit Connect"],
  ["Vauxhall", "Vivaro"], ["Volkswagen", "Amarok"], ["Peugeot", "Partner"], ["Mitsubishi", "L200"], ["Citroen", "Dispatch"], ["Peugeot", "Expert"], ["Citroen", "Berlingo"], ["Vauxhall", "Combo"], ["Toyota", "Proace"],
  ["Renault", "Kangoo"], ["Iveco", "Daily"],
  ["Volkswagen", "Transporter"], ["Fiat", "Ducato"], ["Fiat", "Doblo"], ["Citroen", "Relay"], ["Renault", "Master"], ["Peugeot", "Boxer"], ["Nissan", "NV200"], ["Volkswagen", "Crafter"], ["Vauxhall", "Movano"],
  ["Mercedes-Benz", "Sprinter"], ["Mercedes-Benz", "Vito"],
];

export const USED_VAN_MODELS: readonly UsedVanModel[] = RAW.map(([make, model]) => ({
  make,
  model,
  makeSlug: slugify(make),
  modelSlug: slugify(model),
  pageSlug: slugify(`${make}-${model}-vans-for-sale`),
}));

export function findUsedVanModel(makeSlug: string, modelSlug: string): UsedVanModel | undefined {
  return USED_VAN_MODELS.find((m) => m.makeSlug === makeSlug && m.modelSlug === modelSlug);
}

export function usedVanModelsOfMake(makeSlug: string): UsedVanModel[] {
  return USED_VAN_MODELS.filter((m) => m.makeSlug === makeSlug);
}

export interface UsedVanMake {
  make: string;
  makeSlug: string;
  models: UsedVanModel[];
}

export function usedVanMakes(): UsedVanMake[] {
  const out = new Map<string, UsedVanMake>();
  for (const m of USED_VAN_MODELS) {
    const e = out.get(m.makeSlug) ?? { make: m.make, makeSlug: m.makeSlug, models: [] };
    e.models.push(m);
    out.set(m.makeSlug, e);
  }
  return [...out.values()].sort((a, b) => a.make.localeCompare(b.make));
}

export const usedVanPath = (m: UsedVanModel) => `/used-vans/${m.makeSlug}/${m.modelSlug}`;
/** The stock-driven sibling page that already exists (listing pages, filters): cross-linked from every /used-vans page. */
export const vansPath = (m: UsedVanModel) => `/vans/${m.makeSlug}/${m.modelSlug}`;
