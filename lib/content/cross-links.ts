import type { NewVanEntry } from "./new-vans";
import type { BlogPost } from "./blog";

/** Infer /vans/* body-type slug from a new-van slug + model string */
export function inferBodyType(slug: string, model = ""): { slug: string; label: string } {
  const s = (slug + " " + model).toLowerCase();
  if (/tipper/.test(s)) return { slug: "tipper", label: "Tipper vans" };
  if (/luton/.test(s)) return { slug: "luton", label: "Luton vans" };
  if (/crew[- ]cab|crew[- ]van/.test(s)) return { slug: "crew-van", label: "Crew vans" };
  if (/minibus|tourneo/.test(s)) return { slug: "minibus", label: "Minibuses" };
  if (/chassis[- ]cab/.test(s)) return { slug: "chassis-cab", label: "Chassis cab vans" };
  if (/dropside/.test(s)) return { slug: "dropside", label: "Dropside vans" };
  if (/ranger|hilux|amarok/.test(s)) return { slug: "pickup", label: "Pickup trucks" };
  return { slug: "panel-van", label: "Panel vans" };
}

/** Convert a make display name ("Citroën", "Mercedes-Benz") to URL slug */
export function makeToSlug(make: string): string {
  return make
    .toLowerCase()
    .replace(/[ëéèê]/g, "e")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Return blog posts whose title or description contains at least one keyword.
 * Keywords are matched case-insensitively.
 */
export function matchBlogPosts(
  posts: BlogPost[],
  keywords: string[],
  excludeSlug?: string,
  limit = 3,
): BlogPost[] {
  const kws = keywords.map((k) => k.toLowerCase());
  return posts
    .filter((p) => {
      if (p.slug === excludeSlug) return false;
      const text = (p.title + " " + p.description).toLowerCase();
      return kws.some((k) => text.includes(k));
    })
    .slice(0, limit);
}

/**
 * Return new-van entries sharing at least one keyword, excluding the current slug.
 * Prefer same-make matches; fall back to broader keyword match.
 */
export function matchRelatedVans(
  entries: NewVanEntry[],
  keywords: string[],
  excludeSlug: string,
  limit = 4,
): NewVanEntry[] {
  const kws = keywords.map((k) => k.toLowerCase());
  return entries
    .filter((e) => {
      if (e.slug === excludeSlug) return false;
      const text = (e.make + " " + e.model + " " + e.slug).toLowerCase();
      return kws.some((k) => text.includes(k));
    })
    .slice(0, limit);
}

/**
 * Extract plain-text keywords from a blog post title for reverse-matching to
 * new-van entries and category pages.
 */
export function blogKeywords(title: string, description: string): string[] {
  const makes = ["ford", "volkswagen", "vw", "mercedes", "vauxhall", "renault",
    "citro", "citroen", "peugeot", "fiat", "nissan", "toyota", "iveco", "maxus",
    "land rover", "isuzu", "mitsubishi"];
  const bodyTypes = ["tipper", "luton", "crew", "minibus", "chassis", "dropside",
    "pickup", "ranger", "hilux", "amarok"];
  const fuel = ["electric", "ev", "hybrid", "phev"];
  const combined = (title + " " + description).toLowerCase();
  const found: string[] = [];
  for (const kw of [...makes, ...bodyTypes, ...fuel]) {
    if (combined.includes(kw)) found.push(kw);
  }
  return found;
}
