/**
 * Internal-link helpers for the content hubs: pure functions over a list of items (guides or van news), so they are testable without the API.
 * A crawler only reaches a page that something links to, and a /blog or /van-news index is one link. Every article therefore also gets its neighbours in publication order
 * (so no article is ever linked from nothing but the index), and every make/model page gets the articles that name its make.
 */
export interface LinkItem {
  slug: string;
  title: string;
  date: string;
}

const time = (d: string) => Date.parse(d) || 0;

/** Newest first; an item with no date sorts last, ties keep their order. */
export function sortNewestFirst<T extends LinkItem>(items: T[]): T[] {
  return items
    .map((p, i) => ({ p, i }))
    .sort((a, b) => time(b.p.date) - time(a.p.date) || a.i - b.i)
    .map(({ p }) => p);
}

/** The next newer and next older item around `slug` in a newest-first list (null at either end, or when the slug is not in the list). */
export function neighbours<T extends LinkItem>(sorted: T[], slug: string): { newer: T | null; older: T | null } {
  const i = sorted.findIndex((p) => p.slug === slug);
  if (i === -1) return { newer: null, older: null };
  return { newer: sorted[i - 1] ?? null, older: sorted[i + 1] ?? null };
}

/** Items whose title names any of the terms (whole word, case-insensitive), newest first, excluding `excludeSlug`. */
export function mentioning<T extends LinkItem>(sorted: T[], terms: string[], limit: number, excludeSlug?: string): T[] {
  const res = terms.filter(Boolean).map((t) => new RegExp(`(^|[^a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/[\s-]+/g, "[\\s-]?")}($|[^a-z0-9])`, "i"));
  if (res.length === 0) return [];
  return sorted.filter((p) => p.slug !== excludeSlug && res.some((r) => r.test(p.title))).slice(0, limit);
}

/** The newest `limit` items, optionally skipping one slug. */
export function latest<T extends LinkItem>(sorted: T[], limit: number, excludeSlug?: string): T[] {
  return sorted.filter((p) => p.slug !== excludeSlug).slice(0, limit);
}
