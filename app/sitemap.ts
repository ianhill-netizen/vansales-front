import type { MetadataRoute } from "next";
import { getListings, getModelIndex } from "@/lib/listings/client";
import { getNewVanSlugs } from "@/lib/content/new-vans";
import { getBlogSlugs } from "@/lib/content/blog";
import { listingPath, modelPath } from "@/lib/listings/slug";
import { siteUrl } from "@/lib/site";

const BODY_TYPE_PAGES = [
  "/vans/panel-van",
  "/vans/luton",
  "/vans/tipper",
  "/vans/dropside",
  "/vans/crew-van",
  "/vans/pickup",
  "/vans/minibus",
  "/vans/chassis-cab",
  "/vans/electric",
  "/vans/new",
  "/vans/used",
  "/vans/ulez",
];

const MAKE_PAGES = [
  "/vans/ford",
  "/vans/volkswagen",
  "/vans/mercedes-benz",
  "/vans/vauxhall",
  "/vans/renault",
  "/vans/citroen",
  "/vans/peugeot",
  "/vans/fiat",
  "/vans/nissan",
  "/vans/toyota",
  "/vans/iveco",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [{ listings }, models] = await Promise.all([getListings({}), getModelIndex()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/new-vans`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/van-reviews`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/van-contract-hire`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/van-finance`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/van-insurance`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/vans/electric`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/directory`, changeFrequency: "weekly", priority: 0.6 },
  ];

  const bodyTypeRoutes: MetadataRoute.Sitemap = BODY_TYPE_PAGES.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const makeRoutes: MetadataRoute.Sitemap = MAKE_PAGES.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "daily",
    priority: 0.75,
  }));

  const modelRoutes: MetadataRoute.Sitemap = models.map((m) => ({
    url: `${base}${modelPath(m.make, m.model)}`,
    changeFrequency: "daily",
    priority: 0.8,
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

  const listingRoutes: MetadataRoute.Sitemap = listings.map((l) => ({
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
    ...newVanRoutes,
    ...blogRoutes,
    ...listingRoutes,
  ];
}
