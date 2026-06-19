import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Eyebrow } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { ListingCard } from "@/components/listing-card";
import { getNewVanBySlug, getNewVanSlugs } from "@/lib/content/new-vans";
import { getListings } from "@/lib/listings/client";
import { mdToHtml } from "@/lib/content/markdown";
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

  // Fetch live Dealski stock for this make/model
  const stockResult = await getListings({
    make: van.make !== "Van" ? van.make : undefined,
    pageSize: 6,
  });

  const breadcrumbs = [
    { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
    { "@type": "ListItem", position: 2, name: "New vans", item: absUrl("/new-vans") },
    { "@type": "ListItem", position: 3, name: van.title, item: absUrl(`/new-vans/${slug}`) },
  ];

  const jsonLd = [
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
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs,
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />

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
                  alt={`${van.title}`}
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
                <ListingCard key={l.id} listing={l} priority={i === 0} />
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
    </>
  );
}
