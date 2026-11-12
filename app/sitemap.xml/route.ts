import { siteUrl } from "@/lib/site";
import { getSitemapGroups } from "@/lib/sitemap/build";
import { GROUPS, newestLastmod, sitemapIndexXml } from "@/lib/sitemap/xml";

// The sitemap index. One child sitemap per kind of page (/sitemaps/blog.xml, /sitemaps/van-news.xml ...) so Search Console reports submitted/indexed per kind.
// Rebuilt every 5 minutes from live stock and content; see lib/sitemap/build.ts for where every lastmod comes from.
export const revalidate = 300;

export async function GET() {
  const base = siteUrl();
  const groups = await getSitemapGroups();
  const children = GROUPS.filter((g) => groups[g].length > 0).map((g) => ({ loc: `${base}/sitemaps/${g}.xml`, lastmod: newestLastmod(groups[g]) }));
  return new Response(sitemapIndexXml(children), { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600" } });
}
