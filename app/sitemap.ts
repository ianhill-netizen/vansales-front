import type { MetadataRoute } from "next";
import { getListings } from "@/lib/listings/client";
import { getNewVanSlugs } from "@/lib/content/new-vans";
import { getBlogSlugs } from "@/lib/content/blog";
import { getDealerDirectory } from "@/lib/dealers/directory";
import { listingPath } from "@/lib/listings/slug";
import { CATEGORIES } from "@/lib/seo/categories";
import { categoryListings, loadCatalogue, makeStat, modelStat, statOf } from "@/lib/seo/catalogue";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [{ listings }, idx, dealers] = await Promise.all([
    getListings({}),
    loadCatalogue(),
    getDealerDirectory().catch(() => []),
  ]);
  // lastmod = the newest listing update behind the page (never an invented date); a page with no data of its own falls back to the newest update site-wide.
  const siteLast = idx.site.lastModified ?? undefined;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: siteLast, changeFrequency: "daily", priority: 1 },
    { url: `${base}/vans`, lastModified: siteLast, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/dealers`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/new-vans`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/van-reviews`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/van-contract-hire`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/van-finance`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/van-insurance`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/advertise`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/sell`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/directory`, changeFrequency: "weekly", priority: 0.6 },
  ];

  // Category pages (body types, electric, ULEZ): always indexable.
  const bodyTypeRoutes: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${base}/vans/${c.slug}`,
    lastModified: statOf(categoryListings(idx, c)).lastModified ?? siteLast,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // Make pages: every make with stock (a make with none is noindex, so it stays out).
  const makeRoutes: MetadataRoute.Sitemap = [...idx.byMake.keys()]
    .filter((slug) => makeStat(idx, slug).count > 0)
    .map((slug) => ({
      url: `${base}/vans/${slug}`,
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

  const dealerRoutes: MetadataRoute.Sitemap = dealers.map((d) => ({
    url: `${base}/dealer/${d.slug}`,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const newVanRoutes: MetadataRoute.Sitemap = getNewVanSlugs().map((slug) => ({
    url: `${base}/new-vans/${slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const blogRoutes: MetadataRoute.Sitemap = getBlogSlugs().map((slug) => ({
    url: `${base}/blog/${slug}`,
    changeFrequency: "monthly",
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

  return [
    ...staticRoutes,
    ...bodyTypeRoutes,
    ...makeRoutes,
    ...modelRoutes,
    ...dealerRoutes,
    ...newVanRoutes,
    ...blogRoutes,
    ...listingRoutes,
  ];
}
