import { getListings, isCatalogueDegraded } from "@/lib/listings/client";
import { getVanNewsArticles } from "@/lib/content/van-news";
import { getBlogIndex } from "@/lib/content/blog";
import { getBackendGuides, getContentPublishedDates } from "@/lib/content/backend";
import { getLiveModelPageSlugs } from "@/lib/content/model-pages";
import { getBodyTypeDates, getLiveBodyTypeSlugs } from "@/lib/content/body-type-pages";
import { BODY_TYPE_PAGES, bodyTypePath } from "@/lib/used-vans/body-types";
import { USED_VAN_MODELS, usedVanPath } from "@/lib/used-vans/models";
import { getDealerDirectory } from "@/lib/dealers/directory";
import { dealerIndexable, townSlug } from "@/lib/dealers/places";
import { listingPath } from "@/lib/listings/slug";
import { CATEGORIES } from "@/lib/seo/categories";
import { categoryListings, loadCatalogue, makeStat, modelStat, statOf } from "@/lib/seo/catalogue";
import { siteUrl } from "@/lib/site";
import { makeVansPath } from "@/lib/seo/make-url";
import { getLiveSellSlugs } from "@/lib/content/sell-pages";
import { SELL_PAGES, sellPagePath } from "@/lib/sell-pages";
import { STOCK_FEEDS_LASTMOD, STOCK_FEEDS_PATH } from "@/lib/stock-feeds";
import { LANDING_PAGES } from "@/lib/landing-pages";
import { getLiveLandingSlugs } from "@/lib/content/landing-pages";
import { getLiveGeoKeys } from "@/lib/content/geo";
import { GEO_NODES, geoPath } from "@/lib/geo/tree";
import { TOWNS, findPlace } from "@/lib/geo/towns";
import { summarisePlace } from "@/lib/geo/summary";
import { getLiveAccessorySlugs } from "@/lib/content/accessories";
import { ACCESSORIES, ACCESSORY_BACKEND_SLUGS, ACCESSORY_HUB } from "@/lib/accessories";
import { getLiveMakeHubSlugs } from "@/lib/content/make-hubs";
import { buildRedirects } from "@/lib/redirects/all";
import { GROUPS, dedupeEntries, newestLastmod, splitByGroup, type GroupName, type SitemapEntry } from "@/lib/sitemap/xml";

// The geography pages' sitemap entries are worked out from stock and dealers, so they are recomputed nightly rather than on every sitemap build.
const GEO_TTL_MS = 24 * 60 * 60 * 1000;
let geoCache: { at: number; paths: string[] } | null = null;

/** Nation and region pages (when their guide is published), city pages and towns when they meet the index rule (lib/geo/config.ts). */
async function geoPaths(listings: Awaited<ReturnType<typeof getListings>>["listings"], dealers: Awaited<ReturnType<typeof getDealerDirectory>>): Promise<string[]> {
  if (geoCache && Date.now() - geoCache.at < GEO_TTL_MS) return geoCache.paths;
  const nodes = GEO_NODES;
  const live = await getLiveGeoKeys(nodes.map((n) => n.key));
  const vans = listings.filter((l) => l.status === "active");
  const ds = dealers.filter((d) => dealerIndexable({ stockCount: d.vanCount, hasAbout: d.hasAbout, configured: d.configured }));
  const paths: string[] = [];
  for (const n of nodes) {
    if (!live.has(n.key)) continue;
    if (n.kind === "city") { const p = findPlace(n.key)!; if (!summarisePlace({ lat: p.la, lng: p.ln }, vans, ds).indexable) continue; }
    paths.push(geoPath(n.key));
  }
  for (const t of TOWNS) if (summarisePlace({ lat: t.la, lng: t.ln }, vans, ds).indexable) paths.push(geoPath(t.s));
  geoCache = { at: Date.now(), paths };
  return paths;
}

export type SitemapGroups = Record<GroupName, SitemapEntry[]>;

// The last sitemap built from a healthy stock feed. While a feed is failing (rate limit, outage) the stock-driven URLs would be missing or wrong, so this one is served instead of a thin sitemap that drops real make, model and listing pages.
let lastGood: SitemapGroups | null = null;

export async function getSitemapGroups(): Promise<SitemapGroups> {
  const built = await buildSitemap();
  if (!built.degraded) {
    lastGood = built.groups;
    return built.groups;
  }
  return lastGood ?? built.groups;
}

/**
 * Every URL, with a lastmod ONLY where the source has a real date:
 *   listings            the advert's updated_at
 *   /vans category, make and model pages   the newest updated_at of the adverts on the page (no site-wide fallback: a page with no adverts gets no lastmod)
 *   / and /vans         the newest advert update on the site
 *   local blog posts    the post's front-matter date; backend guides, van news, model pages, make hubs, landing pages: published_at; body-type pages: updated_at
 *   /blog, /van-news    the newest article date they list
 *   everything else     none (dealers, sell pages, static pages): omitted rather than invented
 */
async function buildSitemap(): Promise<{ groups: SitemapGroups; degraded: boolean }> {
  const base = siteUrl();
  const degraded = await isCatalogueDegraded().catch(() => true);
  const [{ listings }, idx, dealers, guides, vanNews, contentDates, bodyTypeDates] = await Promise.all([
    getListings({}),
    loadCatalogue(),
    getDealerDirectory().catch(() => []),
    getBackendGuides().catch(() => []),
    getVanNewsArticles().catch(() => []),
    getContentPublishedDates().catch(() => new Map<string, string>()),
    getBodyTypeDates().catch(() => new Map<string, string>()),
  ]);
  const liveModelPages = await getLiveModelPageSlugs().catch(() => new Set<string>());
  const usedVanModels = USED_VAN_MODELS.filter((m) => liveModelPages.has(m.pageSlug));
  const liveSell = await getLiveSellSlugs().catch(() => new Set<string>());
  const liveAccessories = await getLiveAccessorySlugs(ACCESSORY_BACKEND_SLUGS).catch(() => new Set<string>());
  const liveLanding = await getLiveLandingSlugs().catch(() => new Set<string>());
  const liveBodyTypes = await getLiveBodyTypeSlugs().catch(() => new Set<string>());
  const liveHubs = await getLiveMakeHubSlugs().catch(() => new Set<string>());

  const siteLast = idx.site.lastModified ?? undefined;
  const e = (path: string, lastModified?: Date | string | null): SitemapEntry => ({ url: `${base}${path}`, lastModified });

  const blogPosts = getBlogIndex();
  const localBlog = new Set(blogPosts.map((p) => p.slug));
  const newestBlog = newestLastmod([...blogPosts.map((p) => ({ url: "", lastModified: p.date })), ...guides.map((g) => ({ url: "", lastModified: g.date }))]);
  const newestNews = newestLastmod(vanNews.map((a) => ({ url: "", lastModified: a.publishedAt })));

  const staticRoutes: SitemapEntry[] = [
    e("/", siteLast),
    e("/vans", siteLast),
    e("/dealers"),
    e("/van-news", newestNews),
    e("/blog", newestBlog),
    e("/sitemap"),
    e("/van-reviews"),
    e("/van-finance"),
    e("/van-insurance"),
    e("/van-warranty"),
    e("/van-breakdown-cover"),
    e("/advertise"),
    e(STOCK_FEEDS_PATH, STOCK_FEEDS_LASTMOD),   // a real date from the page's data module, updated when its copy changes
    e("/sell"),
    e("/directory"),
  ];
  const sellRoutes = SELL_PAGES.filter((p) => liveSell.has(p.slug)).map((p) => e(sellPagePath(p)));
  const landingRoutes = LANDING_PAGES.filter((p) => liveLanding.has(p.backendSlug) && !p.path.startsWith("/vans-for-sale/")).map((p) => e(p.path, contentDates.get(p.backendSlug)));
  const accessoryRoutes = [ACCESSORY_HUB, ...ACCESSORIES].filter((a) => liveAccessories.has(a.backendSlug)).map((a) => e(a.path, contentDates.get(a.backendSlug)));
  const geoRoutes = degraded ? [] : (await geoPaths(listings, dealers).catch(() => [] as string[])).map((p) => e(p));
  const bodyTypeRoutes = CATEGORIES.filter((c) => c.slug !== "electric").map((c) => e(`/vans/${c.slug}`, statOf(categoryListings(idx, c)).lastModified));
  const makeRoutes = [...idx.byMake.keys()].filter((slug) => makeStat(idx, slug).count > 0).map((slug) => e(makeVansPath(slug), makeStat(idx, slug).lastModified));
  // /vans/{make}/{model} redirects to the /used-vans page where that is published, so only the models without one are listed.
  const guideModels = new Set(usedVanModels.map((m) => `${m.makeSlug}/${m.modelSlug}`));
  const modelRoutes = [...idx.byModel.keys()].filter((key) => !guideModels.has(key)).map((key) => {
    const [m, mod] = key.split("/");
    return e(`/vans/${m}/${mod}`, modelStat(idx, m, mod).lastModified);
  });
  const usedVanRoutes: SitemapEntry[] = usedVanModels.length === 0 ? [] : [
    e("/used-vans"),
    ...[...new Set(usedVanModels.map((m) => m.makeSlug))].map((slug) => e(`/used-vans/${slug}`, contentDates.get(slug))),
    ...usedVanModels.map((m) => e(usedVanPath(m), contentDates.get(m.pageSlug))),
  ];
  const makeHubRoutes = [...liveHubs].map((slug) => e(`/used-vans/${slug}`, contentDates.get(slug)));
  const usedVanBodyTypeRoutes = BODY_TYPE_PAGES.filter((b) => liveBodyTypes.has(b.slug)).map((b) => e(bodyTypePath(b), bodyTypeDates.get(b.slug)));
  // A dealer page is listed only when it is indexed (stock or an about text; Swiss Vans always): the same rule as its robots meta. A town page is listed for every town with at least one dealer.
  const dealerRoutes = dealers.filter((d) => dealerIndexable({ stockCount: d.vanCount, hasAbout: d.hasAbout, configured: d.configured })).map((d) => e(`/dealer/${d.slug}`));
  const dealerTownRoutes = [...new Set(dealers.filter((d) => d.town).map((d) => townSlug(d.town)))].filter(Boolean).map((t) => e(`/dealers/${t}`));
  const vanNewsRoutes = vanNews.map((a) => e(`/van-news/${a.slug}`, a.publishedAt));
  const blogRoutes = blogPosts.map((p) => e(`/blog/${p.slug}`, p.date));
  const guideRoutes = guides.filter((g) => !localBlog.has(g.slug)).slice(0, 1000).map((g) => e(`/blog/${g.slug}`, g.date));
  const listingRoutes = listings.filter((l) => l.status === "active" || l.status === "reserved").map((l) => e(listingPath(l), l.updated_at));

  const all = [
    ...staticRoutes, ...bodyTypeRoutes, ...makeRoutes, ...modelRoutes, ...dealerRoutes, ...dealerTownRoutes, ...vanNewsRoutes, ...blogRoutes, ...guideRoutes,
    ...usedVanRoutes, ...makeHubRoutes, ...usedVanBodyTypeRoutes, ...sellRoutes, ...landingRoutes, ...accessoryRoutes, ...geoRoutes, ...listingRoutes,
  ];
  // A URL that redirects is never listed (retired pages such as /dealer/van-viking and its listings must not stay in the sitemap while the API catches up).
  const redirected = new Set(buildRedirects().filter((r) => !r.source.includes(":")).map((r) => r.source.toLowerCase()));
  const entries = dedupeEntries(all.filter((x) => !redirected.has(new URL(x.url).pathname.toLowerCase())));
  return { groups: splitByGroup(entries), degraded };
}

export { GROUPS };
