import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Eyebrow } from "@/components/ui";
import { ListingCard } from "@/components/listing-card";
import { JsonLd } from "@/components/json-ld";
import { getListings } from "@/lib/listings/client";
import { getNewVanIndex } from "@/lib/content/new-vans";
import { getBlogIndex } from "@/lib/content/blog";
import { matchBlogPosts } from "@/lib/content/cross-links";
import { RelatedLinks } from "@/components/related-links";
import { SITE, absUrl } from "@/lib/site";
import { slugify } from "@/lib/listings/slug";
import { ALL_MAKES, getMakeBySlug, getModelBySlug } from "@/lib/taxonomy/van-makes";
import { resolveModelSlug } from "@/lib/models/image";

export const revalidate = 3600;

export async function generateStaticParams() {
  return ALL_MAKES.map((m) => ({ make: m.slug }));
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
  const { make } = await params;
  if (CATEGORY_SLUGS.has(make)) return {};
  const makeName = slugToMake(make);
  // Unique per make: real stock count and the models actually in stock.
  const { listings, total } = await getListings({ make: makeName, pageSize: 24 });
  const names: string[] = [];
  for (const l of listings) {
    const r = resolveModelSlug(l.make, l.model);
    const n = (r && getModelBySlug(r.makeSlug, r.modelSlug)?.name) || null;
    if (n && !names.includes(n)) names.push(n);
  }
  const title = `${makeName} Vans for Sale`;
  const description = total > 0
    ? `Browse ${total.toLocaleString("en-GB")} ${makeName} vans for sale across the UK${names.length ? `, including ${names.slice(0, 3).join(", ")}` : ""}. New and used ${makeName} vans from dealers and private sellers on ${SITE.name}.`
    : `Browse ${makeName} vans for sale across the UK. New and used ${makeName} panel vans, crew vans and more on ${SITE.name}.`;
  return {
    title,
    description,
    alternates: { canonical: absUrl(`/vans/${make}`) },
    openGraph: { title: `${title} · ${SITE.name}`, description, url: absUrl(`/vans/${make}`), type: "website" },
    twitter: { card: "summary_large_image", title: `${title} · ${SITE.name}`, description },
  };
}

export default async function MakePage({
  params,
}: {
  params: Promise<{ make: string }>;
}) {
  const { make } = await params;

  // Redirect category slugs — should never reach here due to static routes, but safety net
  if (CATEGORY_SLUGS.has(make)) notFound();

  const makeName = slugToMake(make);
  const result = await getListings({ make: makeName, pageSize: 24 });

  // If no results and likely not a real make, 404
  if (result.total === 0 && result.servedBy !== "mock") notFound();

  // Blog posts mentioning this make
  const relatedBlog = matchBlogPosts(getBlogIndex(), [make, makeName.toLowerCase()], undefined, 3);

  // New-van model guide entries for this make
  const makeNewVans = getNewVanIndex().filter(
    (e) => slugify(e.make) === make || slugify(e.make) === slugify(makeName)
  ).slice(0, 8);

  const breadcrumbs = [
    { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
    { "@type": "ListItem", position: 2, name: "Vans", item: absUrl("/vans") },
    { "@type": "ListItem", position: 3, name: `${makeName} vans`, item: absUrl(`/vans/${make}`) },
  ];

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${makeName} Vans for Sale`,
        url: absUrl(`/vans/${make}`),
        description: `${makeName} vans for sale in the UK.`,
        breadcrumb: { "@type": "BreadcrumbList", itemListElement: breadcrumbs },
      }} />

      <section className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link>
            <span>/</span>
            <Link href="/vans" className="hover:text-ink-900">Vans</Link>
            <span>/</span>
            <span className="font-medium text-ink-700">{makeName}</span>
          </nav>
          <Eyebrow>Make</Eyebrow>
          <h1 className="mt-2 font-display text-[var(--text-3xl)] font-extrabold leading-tight text-ink-900">
            {makeName} vans for sale
          </h1>
          <p className="mt-2 text-[var(--text-md)] text-ink-600">
            <span className="font-mono font-bold text-brand-600">{result.total.toLocaleString()}</span>{" "}
            {result.total === 1 ? "van" : "vans"} available
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={`/vans?condition=new&q=${encodeURIComponent(makeName)}`} className="rounded-[var(--radius-pill)] border border-border bg-white px-5 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400">
              New {makeName}
            </Link>
            <Link href={`/vans?condition=used&q=${encodeURIComponent(makeName)}`} className="rounded-[var(--radius-pill)] border border-border bg-white px-5 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400">
              Used {makeName}
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {result.listings.length === 0 ? (
              <div className="rounded-[var(--radius-lg)] border border-dashed border-border-strong bg-card p-10 text-center">
                <h2 className="font-display text-[var(--text-xl)] font-bold text-ink-900">No {makeName} vans in stock right now</h2>
                <p className="mx-auto mt-2 max-w-sm text-[var(--text-sm)] text-ink-500">Check back soon — stock updates regularly.</p>
                <Link href="/vans" className="mt-4 inline-flex items-center gap-1.5 text-[var(--text-sm)] font-semibold text-brand-700 hover:underline">
                  Browse all vans
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {result.listings.map((l, i) => (
                  <ListingCard key={l.id} listing={l} priority={i < 3} cardIndex={i} />
                ))}
              </div>
            )}

            {result.total > 24 && (
              <div className="mt-8 text-center">
                <Link href={`/vans?q=${encodeURIComponent(makeName)}`} className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-ink-900 px-6 py-3 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700">
                  View all {result.total} {makeName} vans →
                </Link>
              </div>
            )}
          </div>

          {(makeNewVans.length > 0 || relatedBlog.length > 0) && (
            <div className="space-y-5">
              {makeNewVans.length > 0 && (
                <div className="rounded-[var(--radius-xl)] border border-border bg-white p-5">
                  <RelatedLinks
                    title={`${makeName} model guide`}
                    links={makeNewVans.map((e) => ({ href: `/new-vans/${e.slug}`, label: e.title }))}
                  />
                  <Link href="/new-vans" className="mt-4 block text-[var(--text-sm)] font-semibold text-ink-500 hover:text-ink-900">
                    All new van models →
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
    </>
  );
}
