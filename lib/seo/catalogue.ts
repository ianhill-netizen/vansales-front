import { getListings } from "@/lib/listings/client";
import { resolveModelSlug } from "@/lib/models/image";
import { slugify } from "@/lib/listings/slug";
import { getMakeByName, getMakeBySlug, getModelBySlug } from "@/lib/taxonomy/van-makes";
import type { Listing } from "@/lib/listings/types";
import { CATEGORIES, type CategoryDef } from "./categories";

/* =============================================================================
   CATALOGUE STATS for the SEO pages: stock counts, price / year ranges and the
   mix of body types and fuels, per make, per model and per category. Everything
   is derived from the same catalogue the search uses (one load per request).
   ============================================================================= */

export interface Stat {
  count: number;
  minPrice: number | null;
  maxPrice: number | null;
  minYear: number | null;
  maxYear: number | null;
  fuels: string[];
  bodyStyles: string[];
  wheelbases: string[];
  payloadMin: number | null;
  payloadMax: number | null;
  lastModified: Date | null;
}

export interface ModelStat extends Stat {
  makeSlug: string;
  modelSlug: string;
  makeName: string;
  name: string; // "Transit Custom"
}

const titleCase = (s: string) => s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());

function rank(values: (string | null | undefined)[]): string[] {
  const m = new Map<string, number>();
  for (const v of values) {
    if (!v || v === "—") continue;
    const k = titleCase(v.trim());
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
}

export function statOf(listings: Listing[]): Stat {
  const prices = listings.map((l) => l.price).filter((p): p is number => p != null && p > 0);
  const years = listings.map((l) => l.year).filter((y) => y > 1990);
  const payloads = listings.map((l) => l.van_spec.payload_kg).filter((p): p is number => p != null && p > 0);
  const dates = listings.map((l) => +new Date(l.updated_at)).filter((d) => Number.isFinite(d));
  return {
    count: listings.length,
    minPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: prices.length ? Math.max(...prices) : null,
    minYear: years.length ? Math.min(...years) : null,
    maxYear: years.length ? Math.max(...years) : null,
    fuels: rank(listings.map((l) => l.fuel)),
    bodyStyles: rank(listings.map((l) => l.van_spec.body_style)),
    wheelbases: rank(listings.map((l) => (l.van_spec.wheelbase ? l.van_spec.wheelbase.toUpperCase() : null))),
    payloadMin: payloads.length ? Math.min(...payloads) : null,
    payloadMax: payloads.length ? Math.max(...payloads) : null,
    lastModified: dates.length ? new Date(Math.max(...dates)) : null,
  };
}

const EMPTY: Stat = statOf([]);

export interface CatalogueIndex {
  all: Listing[];
  site: Stat;
  /** make slug → listings */
  byMake: Map<string, Listing[]>;
  /** "make/model" (base model slug) → listings */
  byModel: Map<string, Listing[]>;
}

export async function loadCatalogue(): Promise<CatalogueIndex> {
  const { listings } = await getListings({});
  const byMake = new Map<string, Listing[]>();
  const byModel = new Map<string, Listing[]>();
  for (const l of listings) {
    const makeSlug = getMakeByName(l.make)?.slug ?? slugify(l.make);
    (byMake.get(makeSlug) ?? byMake.set(makeSlug, []).get(makeSlug)!).push(l);
    const r = resolveModelSlug(l.make, l.model);
    if (r) {
      const key = `${r.makeSlug}/${r.modelSlug}`;
      (byModel.get(key) ?? byModel.set(key, []).get(key)!).push(l);
    }
  }
  return { all: listings, site: statOf(listings), byMake, byModel };
}

export function makeStat(idx: CatalogueIndex, makeSlug: string): Stat {
  const ls = idx.byMake.get(makeSlug);
  return ls ? statOf(ls) : EMPTY;
}

export function modelStat(idx: CatalogueIndex, makeSlug: string, modelSlug: string): ModelStat {
  const ls = idx.byModel.get(`${makeSlug}/${modelSlug}`) ?? [];
  const mk = getMakeBySlug(makeSlug);
  const md = getModelBySlug(makeSlug, modelSlug);
  return { ...statOf(ls), makeSlug, modelSlug, makeName: mk?.name ?? titleCase(makeSlug.replace(/-/g, " ")), name: md?.name ?? titleCase(modelSlug.replace(/-/g, " ")) };
}

/** Every taxonomy model of a make with its stock stats, stocked models first (most stock first), then A–Z. */
export function modelsOfMake(idx: CatalogueIndex, makeSlug: string): ModelStat[] {
  const mk = getMakeBySlug(makeSlug);
  if (!mk) return [];
  return mk.models
    .map((m) => modelStat(idx, makeSlug, m.slug))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** The most-stocked base models across the whole catalogue. */
export function topModels(idx: CatalogueIndex, limit = 12): ModelStat[] {
  return [...idx.byModel.keys()]
    .map((key) => {
      const [m, mod] = key.split("/");
      return modelStat(idx, m, mod);
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export function categoryListings(idx: CatalogueIndex, c: CategoryDef): Listing[] {
  return idx.all.filter((l) => {
    if (c.filter.bodyStyle) return slugify(l.van_spec.body_style) === slugify(c.filter.bodyStyle);
    if (c.filter.fuel) return slugify(l.fuel) === slugify(c.filter.fuel);
    if (c.filter.ulez) return l.ulez;
    return false;
  });
}

/** Popular models for a category: stocked ones by count first, then the curated seed models, de-duplicated, to `limit`. */
export function popularModelsFor(idx: CatalogueIndex, c: CategoryDef, limit = 10): { makeSlug: string; modelSlug: string; label: string; count: number }[] {
  const out = new Map<string, { makeSlug: string; modelSlug: string; label: string; count: number }>();
  const tally = new Map<string, number>();
  for (const l of categoryListings(idx, c)) {
    const r = resolveModelSlug(l.make, l.model);
    if (r) tally.set(`${r.makeSlug}/${r.modelSlug}`, (tally.get(`${r.makeSlug}/${r.modelSlug}`) ?? 0) + 1);
  }
  const add = (key: string, count: number) => {
    if (out.has(key)) return;
    const [m, mod] = key.split("/");
    const mk = getMakeBySlug(m), md = getModelBySlug(m, mod);
    if (!mk || !md) return;
    out.set(key, { makeSlug: m, modelSlug: mod, label: `${mk.name} ${md.name}`, count });
  };
  [...tally.entries()].sort((a, b) => b[1] - a[1]).forEach(([k, n]) => add(k, n));
  c.seedModels.forEach(([m, mod]) => add(`${m}/${mod}`, tally.get(`${m}/${mod}`) ?? 0));
  return [...out.values()].slice(0, limit);
}

export function allCategoryStats(idx: CatalogueIndex) {
  return CATEGORIES.map((c) => ({ def: c, stat: statOf(categoryListings(idx, c)) }));
}
