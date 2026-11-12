import { getAllGuides } from "@/lib/content/all-guides";
import { getVanNewsArticles } from "@/lib/content/van-news";
import { mentioning, sortNewestFirst } from "@/lib/content/related";
import { commonMake, usedVanName, type UsedVanModel } from "@/lib/used-vans/models";
import type { ContentLink } from "@/components/content-links";

const uniq = (a: string[]) => [...new Set(a.filter(Boolean))];

async function load() {
  const [guides, news] = await Promise.all([
    getAllGuides().catch(() => []),
    getVanNewsArticles().catch(() => []),
  ]);
  return { guides, news: sortNewestFirst(news.map((n) => ({ slug: n.slug, title: n.title, date: n.publishedAt }))) };
}

const asLinks = (guides: { slug: string; title: string }[], news: { slug: string; title: string }[]): { guides: ContentLink[]; news: ContentLink[] } => ({
  guides: guides.map((g) => ({ href: `/blog/${g.slug}`, label: g.title })),
  news: news.map((n) => ({ href: `/van-news/${n.slug}`, label: n.title })),
});

/** Guides and van news whose title names the make (or its everyday short name), for a make hub page. */
export async function getMakeContentLinks(make: string, guideLimit = 6, newsLimit = 4) {
  const { guides, news } = await load();
  const terms = uniq([make, commonMake(make)]);
  return asLinks(mentioning(guides, terms, guideLimit), mentioning(news, terms, newsLimit));
}

/** Guides and van news for a model page: the ones naming the model first, topped up with the make's. */
export async function getModelContentLinks(m: UsedVanModel, guideLimit = 6, newsLimit = 4) {
  const { guides, news } = await load();
  const modelTerms = uniq([usedVanName(m), `${m.make} ${m.model}`]);
  const makeTerms = uniq([m.make, commonMake(m.make)]);
  const pick = <T extends { slug: string; title: string; date: string }>(items: T[], limit: number) => {
    const first = mentioning(items, modelTerms, limit);
    const rest = mentioning(items, makeTerms, limit).filter((x) => !first.some((f) => f.slug === x.slug));
    return [...first, ...rest].slice(0, limit);
  };
  return asLinks(pick(guides, guideLimit), pick(news, newsLimit));
}
