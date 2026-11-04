import type { MetadataRoute } from "next";
import { getListings, getModelIndex } from "@/lib/listings/client";
import { getNewVanSlugs } from "@/lib/content/new-vans";
import { getBlogSlugs } from "@/lib/content/blog";
import { getDealerDirectory } from "@/lib/dealers/directory";
import { listingPath } from "@/lib/listings/slug";
import { resolveModelSlug } from "@/lib/models/image";
import { slugify } from "@/lib/listings/slug";
import { POPULAR_MAKES, getMakeByName } from "@/lib/taxonomy/van-makes";
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
  "/vans/ulez",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [{ listings }, models, dealers] = await Promise.all([
    getListings({}),
    getModelIndex(),
    getDealerDirectory().catch(() => []),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/vans`, changeFrequency: "daily", priority: 0.9 },
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

  const bodyTypeRoutes: MetadataRoute.Sitemap = BODY_TYPE_PAGES.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // Make pages: every make with stock, plus the popular makes. (A make page for a make with no stock 404s, so it never goes in.)
  const stockedMakes = new Set<string>();
  for (const m of models) stockedMakes.add(getMakeByName(m.make)?.slug ?? slugify(m.make));
  const makeSlugs = new Set<string>([...stockedMakes]);
  for (const m of POPULAR_MAKES) if (stockedMakes.has(m.slug)) makeSlugs.add(m.slug);
  const makeRoutes: MetadataRoute.Sitemap = [...makeSlugs].map((slug) => ({
    url: `${base}/vans/${slug}`,
    changeFrequency: "daily",
    priority: 0.75,
  }));

  // Model pages: the feed reports verbose strings ("Transit Custom 320 L2 Diesel FWD"). One URL per BASE model, never one per variant string.
  const modelPaths = new Set<string>();
  for (const m of models) {
    const r = resolveModelSlug(m.make, m.model);
    if (r) modelPaths.add(`/vans/${r.makeSlug}/${r.modelSlug}`);
  }
  const modelRoutes: MetadataRoute.Sitemap = [...modelPaths].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

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
