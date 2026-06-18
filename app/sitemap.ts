import type { MetadataRoute } from "next";
import { getListings, getModelIndex } from "@/lib/listings/client";
import { listingPath, modelPath } from "@/lib/listings/slug";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [{ listings }, models] = await Promise.all([getListings({}), getModelIndex()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
  ];

  const modelRoutes: MetadataRoute.Sitemap = models.map((m) => ({
    url: `${base}${modelPath(m.make, m.model)}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const listingRoutes: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${base}${listingPath(l)}`,
    lastModified: new Date(l.updated_at),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...modelRoutes, ...listingRoutes];
}
