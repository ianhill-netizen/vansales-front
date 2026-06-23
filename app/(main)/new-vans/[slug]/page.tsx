import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Eyebrow } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { RelatedLinks } from "@/components/related-links";
import { ListingCard } from "@/components/listing-card";
import { getNewVanBySlug, getNewVanIndex, getNewVanSlugs } from "@/lib/content/new-vans";
import { getBlogIndex } from "@/lib/content/blog";
import { inferBodyType, makeToSlug, matchBlogPosts, matchRelatedVans } from "@/lib/content/cross-links";
import { getListings } from "@/lib/listings/client";
import { mdToHtml } from "@/lib/content/markdown";
import { getNewVanPrice } from "@/lib/content/prices";
import { SITE, absUrl } from "@/lib/site";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getNewVanSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const van = getNewVanBySlug(slug);
  if (!van) return {};
  const title = `${van.title} — Specs, Deals & Stock`.slice(0, 60);
  const description = van.description.slice(0, 155) || `Full specs, engine options and live stock for the ${van.title}.`;
  return {
    title,
    description,
    alternates: { canonical: absUrl(`/new-vans/${slug}`) },
    openGraph: {
      title: `${title} · ${SITE.name}`,
      description,
      url: absUrl(`/new-vans/${slug}`),
      type: "website",
      ...(van.heroImage ? { images: [{ url: absUrl(van.heroImage), width: 1200, height: 630, alt: van.title }] } : {}),
    },
  };
}

export default async function NewVanDetailPage({ params }: Props) {
  const { slug } = await params;
  const van = getNewVanBySlug(slug);
  if (!van) notFound();

  const price = getNewVanPrice(slug);

  const stockResult = await getListings({
    make: van.make !== "Van" ? van.make : undefined,
    pageSize: 6,
  });

  // Cross-link data (synchronous)
  const allVans = getNewVanIndex();
  const allBlog = getBlogIndex();
  const bodyType = inferBodyType(slug, van.model);
  const makeSlug = makeToSlug(van.make);
  const isElectric = /electric|e-transit|e-crafter|e-berlingo|e-tech|kangoo-e/i.test(slug);

  const relatedModels = matchRelatedVans(allVans, [van.make.toLowerCase()], slug, 4);
  const modelKeywords = van.model.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const relatedBlog = matchBlogPosts(allBlog, [van.make.toLowerCase(), ...modelKeywords], undefined, 3);

  const categoryLinks = [
    { href: `/vans/${bodyType.slug}`, label: bodyType.label },
    { href: `/vans/${makeSlug}`, label: `${van.make} vans` },
    { href: "/vans?condition=new", label: "New vans" },
    ...(isElectric ? [{ href: "/vans/electric", label: "Electric vans" }, { href: "/vans/ulez", label: "ULEZ-compliant" }] : []),
  ];

  const breadcrumbs = [
    { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
    { "@type": "ListItem", position: 2, name: "New vans", item: absUrl("/new-vans") },
    { "@type": "ListItem", position: 3, name: van.title, item: absUrl(`/new-vans/${slug}`) },
  ];

  return (
    <>
      <JsonLd data={[
        {
          "@context": "https://schema.org",
          "@type": "Vehicle",
          name: van.title,
          brand: { "@type": "Brand", name: van.make },
          model: van.model,
          vehicleConfiguration: "Van",
          url: absUrl(`/new-vans/${slug}`),
          ...(van.heroImage ? { image: absUrl(van.heroImage) } : {}),
          description: van.description,
        },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: breadcrumbs },
      ]} />

      {/* Hero */}
      <section className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link>
            <span>/</span>
            <Link href="/new-vans" className="hover:text-ink-900">New vans</Link>
            <span>/</span>
            <span className="font-medium text-ink-700">{van.title}</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <Eyebrow>{van.make}</Eyebrow>
              <h1 className="mt-2 font-display text-[var(--text-3xl)] font-extrabold leading-tight text-ink-900">
                {van.title}
              </h1>
              {van.description && (
                <p className="mt-3 text-[var(--text-md)] text-ink-600">{van.description}</p>
              )}
              {price != null && (
                <div className="mt-4 inline-flex items-baseline gap-1.5 rounded-[var(--radius-lg)] bg-brand-50 px-4 py-2.5 ring-1 ring-brand-200">
                  <span className="text-[var(--text-xs)] font-semibold uppercase tracking-wide text-brand-600">From</span>
                  <span className="font-display text-[var(--text-2xl)] font-extrabold text-brand-700">
                    £{price.toLocaleString("en-GB")}
                  </span>
                  <span className="text-[var(--text-xs)] text-brand-600">/month exc. VAT</span>
                </div>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={van.stockHref}
                  className="rounded-[var(--radius-pill)] bg-brand-500 px-6 py-2.5 text-[var(--text-sm)] font-bold text-white hover:bg-brand-600"
                >
                  {stockResult.total > 0 ? `${stockResult.total} in stock now →` : "Browse stock →"}
                </Link>
                <Link
                  href="/advertise"
                  className="rounded-[var(--radius-pill)] border border-border bg-white px-6 py-2.5 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400"
                >
                  Advertise your {van.make}
                </Link>
              </div>
            </div>

            {van.heroImage ? (
              <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-[var(--radius-2xl)] bg-gradient-to-br from-brand-50 to-surface-1 lg:h-72">
                <Image
                  src={van.heroImage}
                  alt={van.title}
                  fill
                  priority
                  className="object-contain p-6"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            ) : (
              <div className="flex h-56 items-center justify-center rounded-[var(--radius-2xl)] bg-gradient-to-br from-brand-900 to-ink-900 lg:h-72">
                <span className="font-display text-[var(--text-2xl)] font-extrabold text-white/20">{van.make}</span>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Live stock strip */}
      {stockResult.listings.length > 0 && (
        <section className="border-b border-border bg-white py-8">
          <Container>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-[var(--text-xl)] font-bold text-ink-900">
                {van.make} vans in stock now
              </h2>
              <Link href={van.stockHref} className="text-[var(--text-sm)] font-semibold text-brand-700 hover:underline">
                View all {stockResult.total} →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stockResult.listings.slice(0, 3).map((l, i) => (
                <ListingCard key={l.id} listing={l} priority={i === 0} cardIndex={i} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Article body */}
      <Container className="py-10">
        <div className="mx-auto max-w-3xl">
          <article
            className="prose-vansales"
            dangerouslySetInnerHTML={{ __html: mdToHtml(van.body) }}
          />
        </div>
      </Container>

      {/* Related cross-links */}
      <section className="border-t border-border bg-surface-1 py-10">
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[var(--radius-xl)] border border-border bg-white p-5">
              <RelatedLinks title="Browse categories" links={categoryLinks} variant="list" />
            </div>

            {relatedModels.length > 0 && (
              <div className="rounded-[var(--radius-xl)] border border-border bg-white p-5">
                <RelatedLinks
                  title={`Other ${van.make} models`}
                  links={relatedModels.map((e) => ({ href: `/new-vans/${e.slug}`, label: e.title }))}
                />
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
        </Container>
      </section>
    </>
  );
}
