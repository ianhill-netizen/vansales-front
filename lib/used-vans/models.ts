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

// The 31 further models the content agent already has published pages for (make_model rows with no route until 2026-11-06): electric variants and the less common models. Same scheme: page slug {make}-{model}-vans-for-sale.
const MORE: ReadonlyArray<readonly [string, string]> = [
  ["BYD", "ET3"], ["Citroen", "E-Dispatch"], ["Citroen", "E-Relay"], ["Fiat", "E-Ducato"], ["Fiat", "E-Scudo"], ["Ford", "E-Transit"], ["Mercedes-Benz", "eSprinter"], ["Mercedes-Benz", "eVito"], ["Peugeot", "E-Boxer"],
  ["Peugeot", "E-Expert"], ["Renault", "Kangoo E-Tech"], ["Renault", "Master E-Tech"], ["Toyota", "Proace Electric"], ["Vauxhall", "Movano Electric"], ["Vauxhall", "Vivaro Electric"], ["Volkswagen", "IDBuzz Cargo"], ["Maxus", "Deliver 9"], ["Maxus", "eDeliver 9"],
  ["Fiat", "Scudo"], ["Ford", "Transit Courier"], ["Ford", "Transit Trail"], ["Isuzu", "D-Max"], ["LDV", "Convoy"], ["LDV", "V80"], ["MAN", "TGE"], ["Mercedes-Benz", "Citan"], ["Nissan", "NV300"],
  ["Nissan", "NV400"], ["Nissan", "Townstar"], ["Toyota", "Hilux Invincible"], ["Vauxhall", "Combo Cargo"],
];

// The stock feeds slug the ID. Buzz Cargo as "id-buzz-cargo" while the content row (and its published backend slug) was written as "IDBuzz Cargo": the URL follows the stock slug, the content slug stays what the backend has.
const URL_MODEL_SLUG: Record<string, string> = { "idbuzz-cargo": "id-buzz-cargo" };

export const USED_VAN_MODELS: readonly UsedVanModel[] = [...RAW, ...MORE].map(([make, model]) => {
  const contentSlug = slugify(model);
  return {
    make,
    model,
    makeSlug: slugify(make),
    modelSlug: URL_MODEL_SLUG[contentSlug] ?? contentSlug,
    pageSlug: slugify(`${make}-${model}-vans-for-sale`),
  };
});

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

/** The URL the model page lives at: /used-vans/{make}/{model}-for-sale (the old /used-vans/{make}/{model} is a 301 to it, see next.config.ts). */
export const usedVanPath = (m: UsedVanModel) => `/used-vans/${m.makeSlug}/${m.modelSlug}-for-sale`;
/** The retired URL, kept only to build the 301s. */
export const usedVanOldPath = (m: UsedVanModel) => `/used-vans/${m.makeSlug}/${m.modelSlug}`;

/** The route's [model] parameter ("transporter-for-sale") to the model; anything without the -for-sale suffix is not a page (the 301 handles the old URL before it gets here). */
export function findUsedVanModelByParam(makeSlug: string, modelParam: string): UsedVanModel | undefined {
  return modelParam.endsWith(FOR_SALE) ? findUsedVanModel(makeSlug, modelParam.slice(0, -FOR_SALE.length)) : undefined;
}

const FOR_SALE = "-for-sale";

/** What people type: VW, Merc. Every other make is itself. */
export function commonMake(make: string): string {
  return make === "Volkswagen" ? "VW" : make === "Mercedes-Benz" ? "Merc" : make;
}
export const usedVanName = (m: UsedVanModel) => `${commonMake(m.make)} ${m.model}`;
export const usedVanH1 = (m: UsedVanModel) => `Used ${usedVanName(m)} For Sale`;
export const usedVanTitle = (m: UsedVanModel) => `${usedVanH1(m)} | Vansales.com`;
export const usedVanDescription = (m: UsedVanModel) => `Browse used ${usedVanName(m)} vans for sale from verified UK dealers. Compare prices, specs and mileage. No nonsense.`;
/** The searchable stock view of this model (the /vans chip filter): cross-linked from every /used-vans page. (/vans/{make}/{model} now redirects to the /used-vans page, so it cannot be this link.) */
export const vansPath = (m: UsedVanModel) => `/vans?v=${m.makeSlug}:${m.modelSlug}`;
