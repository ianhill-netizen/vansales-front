import { getBlogIndex } from "@/lib/content/blog";
import { getBackendGuides } from "@/lib/content/backend";
import { sortNewestFirst, type LinkItem } from "@/lib/content/related";

/** Every guide on /blog: the local markdown posts plus the guides Mason publishes through vansales-backend (a local post wins on a clash), newest first. Falls back to the local posts when the API is down. */
export async function getAllGuides(): Promise<LinkItem[]> {
  const local = getBlogIndex().map((p) => ({ slug: p.slug, title: p.title, date: p.date }));
  const seen = new Set(local.map((p) => p.slug));
  const backend = (await getBackendGuides().catch(() => []))
    .filter((g) => !seen.has(g.slug))
    .map((g) => ({ slug: g.slug, title: g.title, date: g.date }));
  return sortNewestFirst([...local, ...backend]);
}
