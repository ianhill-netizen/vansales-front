import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Eyebrow } from "@/components/ui";
import { ListingCard } from "@/components/listing-card";
import { JsonLd } from "@/components/json-ld";
import { getListings, isCatalogueDegraded } from "@/lib/listings/client";
import { shouldNoindexEmpty } from "@/lib/listings/extras-guard";
import { getVanNewsArticles } from "@/lib/content/van-news";
import { getBlogIndex } from "@/lib/content/blog";
import { matchBlogPosts } from "@/lib/content/cross-links";
import { RelatedLinks } from "@/components/related-links";
import { SITE, absUrl } from "@/lib/site";
import { slugify } from "@/lib/listings/slug";
import { ALL_MAKES, getMakeBySlug } from "@/lib/taxonomy/van-makes";
import { EmptyState } from "@/components/empty/empty-state";
import { MakeLogo } from "@/components/make-logo";
import { InternalLinks } from "@/components/seo/internal-links";
import { loadCatalogue, makeStat, modelsOfMake, topModels } from "@/lib/seo/catalogue";
import { makeIntro, priceRange } from "@/lib/seo/intro";
import { categoryLinks, makeLinks, popularModelLinks } from "@/lib/seo/links";
import { makeSlugFromParam, makeVansPath } from "@/lib/seo/make-url";
import { USED_VAN_MODELS, usedVanPath } from "@/lib/used-vans/models";

export const revalidate = 300; // 5 min: counts come from the vansales API (60 s data cache), so an hour showed stale "0 vans"

export async function generateStaticParams() {
  return ALL_MAKES.map((m) => ({ make: `${m.slug}-vans-for-sale` }));
}

// Static category slugs handled by their own pages — prevent them falling through to here
const CATEGORY_SLUGS = new Set([
  "panel-van", "luton", "tipper", "dropside", "crew-van",
  "pickup", "minibus", "electric", "new", "used", "ulez",
]);

function slugToMake(slug: string): string {
  return getMakeBySlug(slug)?.name ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ make: string }>;
}): Promise<Metadata> {
  const { make: param } = await params;
  const make = makeSlugFromParam(param);
  if (!make || CATEGORY_SLUGS.has(param)) return {};
  const makeName = slugToMake(make);
  // Unique per make: real stock count, price range and the models actually in stock.
  const idx = await loadCatalogue();
  const stat = makeStat(idx, make);
  const title = `${makeName} Vans For Sale | Vansales.com`;
  const description = `Browse used ${makeName} vans for sale from verified UK dealers. All models, body types, payload specs.`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: absUrl(makeVansPath(make)) },
    openGraph: { title, description, url: absUrl(makeVansPath(make)), type: "website" },
    twitter: { card: "summary_large_image", title, description },
    // A make nobody has stock for would be a thin page: keep it out of the index (it stays crawlable so its links still pass on). Only a REAL zero counts: while a stock feed is failing the count proves nothing.
    ...(shouldNoindexEmpty(stat.count, await isCatalogueDegraded()) ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function MakePage({
  params,
}: {
  params: Promise<{ make: string }>;
}) {
  const { make: param } = await params;
  const make = makeSlugFromParam(param);
  if (!make) notFound();   // only /{make}-vans-for-sale is a page; the old /vans/{make} is a 301 in next.config.ts

  // Redirect category slugs — should never reach here due to static routes, but safety net
  if (CATEGORY_SLUGS.has(make)) notFound();

  const makeName = slugToMake(make);
  // Model cards go to the model's buying-guide page (/used-vans/{make}/{model}-for-sale) where there is one, else to the stock page.
  const guideByModel = new Map(USED_VAN_MODELS.map((u) => [`${u.makeSlug}/${u.modelSlug}`, usedVanPath(u)]));
  const result = await getListings({ make: makeName, pageSize: 24 });
  const idx = await loadCatalogue();
  const stat = makeStat(idx, make);
  const modelStats = modelsOfMake(idx, make);
  const popular = topModels(idx, 12);

  // Only an unknown make with no stock is a 404. A real make with no stock right now still renders (noindex, see generateMetadata): the link network points at every make.
  if (!getMakeBySlug(make) && result.total === 0) notFound();

  // Blog posts mentioning this make
  const relatedBlog = matchBlogPosts(getBlogIndex(), [make, makeName.toLowerCase()], undefined, 3);

  // Van News articles for this make (empty when the API is down)
  const makeNews = (await getVanNewsArticles().catch(() => [])).filter((a) => slugify(a.make) === make).slice(0, 5);

  const breadcrumbs = [
    { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
    { "@type": "ListItem", position: 2, name: `Used ${makeName} Vans For Sale`, item: absUrl(makeVansPath(make)) },
  ];

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${makeName} Vans for Sale`,
        url: absUrl(makeVansPath(make)),
        description: `${makeName} vans for sale in the UK.`,
        breadcrumb: { "@type": "BreadcrumbList", itemListElement: breadcrumbs },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: result.total,
          itemListElement: result.listings.slice(0, 24).map((l, i) => ({ "@type": "ListItem", position: i + 1, url: absUrl(`/listing/${l.slug}`), name: `${l.make} ${l.model}` })),
        },
      }} />

      <section className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[length:var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-ink-700">{makeName} vans</span>
          </nav>
          <Eyebrow>Make</Eyebrow>
          <div className="group mt-2 flex items-center gap-3">
            <MakeLogo make={make} name={makeName} size={56} colour />
            <h1 className="font-display text-[length:var(--text-3xl)] font-extrabold leading-tight text-ink-900">
              Used {makeName} Vans For Sale
            </h1>
          </div>
          <p className="mt-2 text-[length:var(--text-md)] text-ink-600">
            <span className="font-mono font-bold text-brand-600">{result.total.toLocaleString()}</span>{" "}
            {result.total === 1 ? "van" : "vans"} available
          </p>
          <p className="mt-3 max-w-3xl text-[length:var(--text-md)] leading-relaxed text-ink-600">{makeIntro(makeName, stat, modelStats)}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={`/vans?condition=new&q=${encodeURIComponent(makeName)}`} className="rounded-[var(--radius-pill)] border border-border bg-white px-5 py-2 text-[length:var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400">
              New {makeName}
            </Link>
            <Link href={`/vans?condition=used&q=${encodeURIComponent(makeName)}`} className="rounded-[var(--radius-pill)] border border-border bg-white px-5 py-2 text-[length:var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400">
              Used {makeName}
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {modelStats.length > 0 && (
              <section aria-labelledby="models-heading" className="mb-10">
                <h2 id="models-heading" className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">{makeName} models</h2>
                <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {modelStats.map((m) => (
                    <li key={m.modelSlug}>
                      <Link
                        href={guideByModel.get(`${make}/${m.modelSlug}`) ?? `/vans/${make}/${m.modelSlug}`}
                        className={`block rounded-[var(--radius-lg)] border p-4 transition-colors hover:border-brand-300 ${m.count > 0 ? "border-border bg-white" : "border-border/70 bg-surface-1"}`}
                      >
                        <span className="block font-display text-[length:var(--text-base)] font-bold text-ink-900">{makeName} {m.name}</span>
                        <span className={`mt-1 block text-[length:var(--text-sm)] ${m.count > 0 ? "font-semibold text-brand-700" : "text-ink-400"}`}>
                          {m.count > 0 ? `${m.count} ${m.count === 1 ? "van" : "vans"} for sale` : "None in stock now"}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {result.listings.length > 0 && <h2 className="mb-4 font-display text-[length:var(--text-xl)] font-bold text-ink-900">All {makeName} vans for sale</h2>}
            {result.listings.length === 0 ? (
              <EmptyState
                illustration="no-vans"
                title={`No ${makeName} vans in stock right now`}
                body="Stock updates through the day. Have a look at everything else in the meantime."
                action={{ label: "Browse all vans", href: "/vans" }}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {result.listings.map((l, i) => (
                  <ListingCard key={l.id} listing={l} priority={i < 3} cardIndex={i} />
                ))}
              </div>
            )}

            {result.total > 24 && (
              <div className="mt-8 text-center">
                <Link href={`/vans?v=${make}`} className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-ink-900 px-6 py-3 text-[length:var(--text-sm)] font-semibold text-white hover:bg-ink-700">
                  View all {result.total} {makeName} vans →
                </Link>
              </div>
            )}
          </div>

          {(makeNews.length > 0 || relatedBlog.length > 0) && (
            <div className="space-y-5">
              {makeNews.length > 0 && (
                <div className="rounded-[var(--radius-xl)] border border-border bg-white p-5">
                  <RelatedLinks
                    title={`${makeName} van news`}
                    links={makeNews.map((a) => ({ href: `/van-news/${a.slug}`, label: a.title }))}
                  />
                  <Link href="/van-news" className="mt-4 block text-[length:var(--text-sm)] font-semibold text-ink-500 hover:text-ink-900">
                    All van news →
                  </Link>
                </div>
              )}
              {relatedBlog.length > 0 && (
                <div className="rounded-[var(--radius-xl)] border border-border bg-white p-5">
                  <RelatedLinks
                    title="Related guides"
                    links={relatedBlog.map((p) => ({ href: `/blog/${p.slug}`, label: p.title }))}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </Container>

      {/* ── Internal link network ───────────────────────────────────────── */}
      <section className="border-t border-border bg-surface-1 py-10">
        <Container className="space-y-9">
          <InternalLinks title="Popular models" links={popularModelLinks(popular)} columns={3} />
          <InternalLinks title="Browse by body type" links={categoryLinks()} columns={3} />
          <InternalLinks title="All makes" links={makeLinks(make)} columns={4} />
        </Container>
      </section>
    </>
  );
}
