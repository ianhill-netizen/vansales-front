import type { Metadata } from "next";
import { autoLink } from "@/lib/content/auto-link";
import { makeVansPath } from "@/lib/seo/make-url";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { getVanNewsArticle, getVanNewsArticles } from "@/lib/content/van-news";
import { ContentLinks, PrevNext } from "@/components/content-links";
import { neighbours, sortNewestFirst } from "@/lib/content/related";
import { getLiveMakeHubSlugs } from "@/lib/content/make-hubs";
import { formatDate } from "@/lib/content/blog";
import { slugify, usedVanModelsOfMake } from "@/lib/used-vans/models";
import { SITE, absUrl, DEFAULT_OG_IMAGES } from "@/lib/site";
import { fitTitle } from "@/lib/seo/title";
import { isCatalogueDegraded } from "@/lib/listings/client";
import { loadCatalogue, makeStat } from "@/lib/seo/catalogue";

export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

// A slug the API has not published is a 404; an unreachable API errors the render instead of caching a 404.
async function load(slug: string) {
  const r = await getVanNewsArticle(slug);
  if (r.status === "unavailable") throw new Error(`van news article ${slug} could not be fetched from the API`);
  return r.status === "ok" ? r.article : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = await load(slug);
  if (!a) return {};
  const title = fitTitle(a.metaTitle, ` · ${SITE.name}`);   // word boundary, suffix counted (a 60-char slice cut words: "workhors")
  const description = a.description.slice(0, 155);
  return {
    title,
    description,
    alternates: { canonical: absUrl(`/van-news/${slug}`) },
    twitter: { card: "summary_large_image", title: `${title} · ${SITE.name}`, description },
    openGraph: { images: DEFAULT_OG_IMAGES, title: `${title} · ${SITE.name}`, description, url: absUrl(`/van-news/${slug}`), type: "article", publishedTime: a.publishedAt },
  };
}

export default async function VanNewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const a = await load(slug);
  if (!a) notFound();
  // The make link is only worth rendering when its page exists and has at least one live listing; a make nobody stocks (or a feed that is down, where a zero proves nothing) gets the generic link instead.
  const makeSlug = a.make ? slugify(a.make) : "";
  const makeHasStock = makeSlug !== "" && !(await isCatalogueDegraded()) && makeStat(await loadCatalogue(), makeSlug).count > 0;
  const stock = makeHasStock ? makeVansPath(makeSlug) : "/vans";
  // Neighbours in publication order, other news about the same make, and the make's used-vans page: every article is linked from other articles, not only from the /van-news index.
  const all = sortNewestFirst((await getVanNewsArticles().catch(() => [])).map((n) => ({ slug: n.slug, title: n.title, date: n.publishedAt, make: n.make })));
  const { newer, older } = neighbours(all, slug);
  const sameMake = a.make ? all.filter((n) => n.make === a.make && n.slug !== slug).slice(0, 4) : [];
  const hubs = makeSlug ? await getLiveMakeHubSlugs().catch(() => new Set<string>()) : new Set<string>();
  const usedMakeLink = makeSlug && (usedVanModelsOfMake(makeSlug).length > 0 || hubs.has(makeSlug)) ? [{ href: `/used-vans/${makeSlug}`, label: `Used ${a.make} vans: buying guides and listings` }] : [];
  return (
    <>
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "NewsArticle", headline: a.title, datePublished: a.publishedAt, author: { "@type": "Organization", name: SITE.name, url: absUrl("/") }, publisher: { "@type": "Organization", name: SITE.name, url: absUrl("/"), logo: { "@type": "ImageObject", url: absUrl("/icons/icon-192.png") } }, url: absUrl(`/van-news/${slug}`), description: a.description },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") }, { "@type": "ListItem", position: 2, name: "Van news", item: absUrl("/van-news") }, { "@type": "ListItem", position: 3, name: a.title, item: absUrl(`/van-news/${slug}`) }] },
      ]} />
      <div className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-eyebrow)] text-ink-400">
            <Link href="/" className="transition-colors hover:text-ink-700">Home</Link><span className="text-ink-300">/</span>
            <Link href="/van-news" className="transition-colors hover:text-ink-700">Van news</Link><span className="text-ink-300">/</span>
            <span className="max-w-[200px] truncate font-semibold text-ink-600">{a.title}</span>
          </nav>
          <div className="max-w-[var(--content-max)]">
            {a.publishedAt && (
              <div className="flex items-center gap-2 text-[length:var(--text-sm)] text-ink-500">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-500" />
                <time dateTime={a.publishedAt} className="font-medium">{formatDate(a.publishedAt)}</time>
              </div>
            )}
            <h1 className="mt-3 font-display text-[length:var(--text-3xl)] font-extrabold leading-tight text-ink-900">{a.title}</h1>
          </div>
        </Container>
      </div>
      <Container className="py-10">
        <div className="mx-auto max-w-[var(--content-max)]">
          {/* body is sanitised on the server (allow-listed tags, no attributes) before it reaches this page */}
          <article className="prose-vs space-y-4 text-[length:var(--text-md)] leading-relaxed text-ink-600 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-[length:var(--text-xl)] [&_h2]:font-bold [&_h2]:text-ink-900 [&_ul]:list-disc [&_ul]:pl-5" dangerouslySetInnerHTML={{ __html: autoLink(a.bodyHtml) }} />
          {a.sources.length > 0 && (
            <aside className="mt-8 border-t border-border pt-4 text-[length:var(--text-sm)] text-ink-500">
              <p className="font-semibold text-ink-700">Sources</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {a.sources.map((s) => <li key={s.url}><a href={s.url} rel="nofollow noopener noreferrer" target="_blank" className="break-all hover:text-brand-700 hover:underline">{s.title}</a></li>)}
              </ul>
            </aside>
          )}
          <PrevNext newer={newer} older={older} base="/van-news" newerLabel="Newer news" olderLabel="Older news" />
          <ContentLinks className="mt-8" title={a.make ? `More ${a.make} news and guides` : "More van news"} links={[...sameMake.map((n) => ({ href: `/van-news/${n.slug}`, label: n.title })), ...usedMakeLink]} />
          <div className="mt-10 flex flex-wrap gap-4 text-[length:var(--text-sm)] font-semibold">
            <Link href={stock} className="text-brand-700 hover:underline">{makeHasStock ? `${a.make} vans for sale →` : "Browse vans for sale →"}</Link>
            <Link href="/van-news" className="text-brand-700 hover:underline">More van news →</Link>
          </div>
        </div>
      </Container>
    </>
  );
}
