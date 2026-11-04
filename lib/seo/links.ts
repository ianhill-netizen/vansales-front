import { ALL_MAKES, getMakeBySlug } from "@/lib/taxonomy/van-makes";
import { CATEGORIES } from "./categories";
import { getCompetitors } from "./competitors";
import type { InternalLink } from "@/components/seo/internal-links";
import type { ModelStat } from "./catalogue";

/* Builders for the link blocks used on every make / model / category page. Anchor text is descriptive ("Ford Transit Custom vans for sale"), never "click here". */

export function makeLinks(excludeSlug?: string): InternalLink[] {
  return ALL_MAKES.filter((m) => m.slug !== excludeSlug).map((m) => ({ href: `/vans/${m.slug}`, label: `${m.name} vans for sale` }));
}

export function categoryLinks(excludeSlug?: string): InternalLink[] {
  return CATEGORIES.filter((c) => c.slug !== excludeSlug).map((c) => ({ href: `/vans/${c.slug}`, label: `${c.label} for sale` }));
}

export function modelLinksOfMake(makeSlug: string, excludeModel?: string): InternalLink[] {
  const mk = getMakeBySlug(makeSlug);
  if (!mk) return [];
  return mk.models.filter((m) => m.slug !== excludeModel).map((m) => ({ href: `/vans/${mk.slug}/${m.slug}`, label: `${mk.name} ${m.name} for sale` }));
}

export function competitorLinks(makeSlug: string, modelSlug: string): InternalLink[] {
  return getCompetitors(makeSlug, modelSlug).map((c) => ({ href: c.href, label: `${c.label} for sale` }));
}

export function popularModelLinks(models: Pick<ModelStat, "makeSlug" | "modelSlug" | "makeName" | "name">[]): InternalLink[] {
  return models.map((m) => ({ href: `/vans/${m.makeSlug}/${m.modelSlug}`, label: `${m.makeName} ${m.name} for sale` }));
}
