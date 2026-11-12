import type { MetadataRoute } from "next";
import { getListings, isCatalogueDegraded } from "@/lib/listings/client";
import { getVanNewsArticles } from "@/lib/content/van-news";
import { getBlogSlugs } from "@/lib/content/blog";
import { getBackendGuides } from "@/lib/content/backend";
import { getLiveModelPageSlugs } from "@/lib/content/model-pages";
import { getLiveBodyTypeSlugs } from "@/lib/content/body-type-pages";
import { BODY_TYPE_PAGES, bodyTypePath } from "@/lib/used-vans/body-types";
import { USED_VAN_MODELS, usedVanPath } from "@/lib/used-vans/models";
import { getDealerDirectory } from "@/lib/dealers/directory";
import { isTestDealer } from "@/lib/dealers/config";
import { listingPath } from "@/lib/listings/slug";
import { CATEGORIES } from "@/lib/seo/categories";
import { categoryListings, loadCatalogue, makeStat, modelStat, statOf } from "@/lib/seo/catalogue";
import { siteUrl } from "@/lib/site";
import { makeVansPath } from "@/lib/seo/make-url";
import { getLiveSellSlugs } from "@/lib/content/sell-pages";
import { SELL_PAGES, sellPagePath } from "@/lib/sell-pages";
import { LANDING_PAGES } from "@/lib/landing-pages";
import { getLiveLandingSlugs } from "@/lib/content/landing-pages";
import { getLiveMakeHubSlugs } from "@/lib/content/make-hubs";

// Rebuilt every 5 minutes from live stock. Without this the sitemap was generated once, at deploy time, and kept whatever stock the API had at that moment (after the make-page change it listed one make page instead of the six that have stock).
export const revalidate = 300;

// The last sitemap built from a healthy stock feed. While a feed is failing (rate limit, outage) the stock-driven URLs would be missing or wrong, so this one is served instead of a thin sitemap that drops real make, model and listing pages.
let lastGoodSitemap: MetadataRoute.Sitemap | null = null;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const built = await buildSitemap();
  if (!built.degraded) {
    lastGoodSitemap = built.entries;
    return built.entries;
  }
  return lastGoodSitemap ?? built.entries;
}

async function buildSitemap(): Promise<{ entries: MetadataRoute.Sitemap; degraded: boolean }> {
  const base = siteUrl();
  const degraded = await isCatalogueDegraded().catch(() => true);
  const [{ listings }, idx, dealers, guides, vanNews] = await Promise.all([
    getListings({}),
    loadCatalogue(),
    getDealerDirectory().catch(() => []),
    getBackendGuides().catch(() => []), // guides Mason publishes through vansales-backend; [] when the API is down
    getVanNewsArticles().catch(() => []), // Van News agent articles; [] when the API is down
  ]);
  // /used-vans: only the allowlisted models that have a published editorial page (empty set when the API is down), and the makes/index that have at least one.
  const liveModelPages = await getLiveModelPageSlugs().catch(() => new Set<string>());
  const usedVanModels = USED_VAN_MODELS.filter((m) => liveModelPages.has(m.pageSlug));
  // The sell-my-van pages: only the published ones (empty when the API is down).
  const liveSell = await getLiveSellSlugs().catch(() => new Set<string>());
  const sellRoutes: MetadataRoute.Sitemap = SELL_PAGES.filter((p) => liveSell.has(p.slug)).map((p) => ({ url: `${base}${sellPagePath(p)}`, changeFrequency: "monthly" as const, priority: 0.7 }));
  // The landing pages (/van-lease-deals, /electric-vans, /vans-for-sale/london, /hire-purchase-vans): only the published ones (empty when the API is down).
  const liveLanding = await getLiveLandingSlugs().catch(() => new Set<string>());
  const landingRoutes: MetadataRoute.Sitemap = LANDING_PAGES.filter((p) => liveLanding.has(p.backendSlug)).map((p) => ({ url: `${base}${p.path}`, changeFrequency: "weekly" as const, priority: 0.7 }));
  // /used-vans/body-type/{slug}: only the published ones (empty when the API is down).
  const liveBodyTypes = await getLiveBodyTypeSlugs().catch(() => new Set<string>());
  const usedVanBodyTypeRoutes: MetadataRoute.Sitemap = BODY_TYPE_PAGES.filter((b) => liveBodyTypes.has(b.slug)).map((b) => ({ url: `${base}${bodyTypePath(b)}`, changeFrequency: "weekly" as const, priority: 0.65 }));
  const usedVanRoutes: MetadataRoute.Sitemap = usedVanModels.length === 0 ? [] : [
    { url: `${base}/used-vans`, changeFrequency: "weekly", priority: 0.7 },
    ...[...new Set(usedVanModels.map((m) => m.makeSlug))].map((slug) => ({ url: `${base}/used-vans/${slug}`, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...usedVanModels.map((m) => ({ url: `${base}${usedVanPath(m)}`, changeFrequency: "weekly" as const, priority: 0.65 })),
  ];
  // /used-vans/{make}: the make hub pages (page_type make_hub). A make the allowlist already lists above is not listed twice. Empty when the API is down.
  const liveHubs = await getLiveMakeHubSlugs().catch(() => new Set<string>());
  const alreadyListed = new Set(usedVanRoutes.map((r) => r.url));
  const makeHubRoutes: MetadataRoute.Sitemap = [...liveHubs].map((slug) => ({ url: `${base}/used-vans/${slug}`, changeFrequency: "weekly" as const, priority: 0.6 })).filter((r) => !alreadyListed.has(r.url));
  // lastmod = the newest listing update behind the page (never an invented date); a page with no data of its own falls back to the newest update site-wide.
  const siteLast = idx.site.lastModified ?? undefined;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: siteLast, changeFrequency: "daily", priority: 1 },
    { url: `${base}/vans`, lastModified: siteLast, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/dealers`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/van-news`, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/van-reviews`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/van-finance`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/van-insurance`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/advertise`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/sell`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/directory`, changeFrequency: "weekly", priority: 0.6 },
  ];

  // Category pages (body types, electric, ULEZ): always indexable.
  const bodyTypeRoutes: MetadataRoute.Sitemap = CATEGORIES.filter((c) => c.slug !== "electric").map((c) => ({
    url: `${base}/vans/${c.slug}`,
    lastModified: statOf(categoryListings(idx, c)).lastModified ?? siteLast,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // Make pages: every make with stock (a make with none is noindex, so it stays out).
  const makeRoutes: MetadataRoute.Sitemap = [...idx.byMake.keys()]
    .filter((slug) => makeStat(idx, slug).count > 0)
    .map((slug) => ({
      url: `${base}${makeVansPath(slug)}`,
      lastModified: makeStat(idx, slug).lastModified ?? siteLast,
      changeFrequency: "daily" as const,
      priority: 0.75,
    }));

  // Model pages: one URL per BASE model with stock, never one per variant string ("Transit Custom 320 L2 Diesel FWD").
  const modelRoutes: MetadataRoute.Sitemap = [...idx.byModel.keys()].map((key) => {
    const [m, mod] = key.split("/");
    return {
      url: `${base}/vans/${m}/${mod}`,
      lastModified: modelStat(idx, m, mod).lastModified ?? siteLast,
      changeFrequency: "daily" as const,
      priority: 0.8,
    };
  });

  const dealerRoutes: MetadataRoute.Sitemap = dealers.filter((d) => !isTestDealer(d.slug)).map((d) => ({
    url: `${base}/dealer/${d.slug}`,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const vanNewsRoutes: MetadataRoute.Sitemap = vanNews.map((a) => ({
    url: `${base}/van-news/${a.slug}`,
    lastModified: Number.isNaN(Date.parse(a.publishedAt)) ? undefined : new Date(a.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const blogRoutes: MetadataRoute.Sitemap = getBlogSlugs().map((slug) => ({
    url: `${base}/blog/${slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const localBlog = new Set(getBlogSlugs());
  const guideRoutes: MetadataRoute.Sitemap = guides
    .filter((g) => !localBlog.has(g.slug))
    .slice(0, 1000)
    .map((g) => ({
      url: `${base}/blog/${g.slug}`,
      lastModified: Number.isNaN(Date.parse(g.date)) ? undefined : new Date(g.date),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  const listingRoutes: MetadataRoute.Sitemap = listings
    .filter((l) => l.status === "active" || l.status === "reserved")
    .map((l) => ({
      url: `${base}${listingPath(l)}`,
      lastModified: new Date(l.updated_at),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  const entries: MetadataRoute.Sitemap = [
    ...staticRoutes,
    ...bodyTypeRoutes,
    ...makeRoutes,
    ...modelRoutes,
    ...dealerRoutes,
    ...vanNewsRoutes,
    ...blogRoutes,
    ...guideRoutes,
    ...usedVanRoutes,
    ...makeHubRoutes,
    ...usedVanBodyTypeRoutes,
    ...sellRoutes,
    ...landingRoutes,
    ...listingRoutes,
  ];
  return { entries, degraded };
}
