import { getSitemapGroups } from "@/lib/sitemap/build";
import { GROUPS, urlsetXml, type GroupName } from "@/lib/sitemap/xml";

// /sitemaps/{group}.xml: the URLs of one kind of page. An unknown group is a 404.
export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export async function GET(_req: Request, { params }: { params: Promise<{ group: string }> }) {
  const raw = (await params).group;
  const name = raw.replace(/\.xml$/, "") as GroupName;
  if (!raw.endsWith(".xml") || !GROUPS.includes(name)) return new Response("Not found", { status: 404 });
  const groups = await getSitemapGroups();
  return new Response(urlsetXml(groups[name]), { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600" } });
}
