import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";
import { ListingCard } from "@/components/listing-card";
import { JsonLd } from "@/components/json-ld";
import { RelatedLinks } from "@/components/related-links";
import { getListings } from "@/lib/listings/client";
import { getBlogIndex } from "@/lib/content/blog";
import { matchBlogPosts } from "@/lib/content/cross-links";
import { SITE, absUrl } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "ULEZ-Compliant Vans for Sale",
  description: "Browse ULEZ-compliant vans for sale. Euro 6 diesel and electric vans exempt from London ULEZ and Clean Air Zone charges. All makes and body types.",
  alternates: { canonical: absUrl("/vans/ulez") },
  openGraph: {
    title: `ULEZ-Compliant Vans for Sale · ${SITE.name}`,
    description: "Euro 6 and electric vans exempt from ULEZ and Clean Air Zone charges.",
    url: absUrl("/vans/ulez"),
    type: "website",
  },
};

export default async function UlezVansPage() {
  const result = await getListings({ ulez: true, pageSize: 6 });
  const relatedBlog = matchBlogPosts(getBlogIndex(), ["ulez", "euro 6", "emission", "clean air", "electric", "ev"], undefined, 3);

  const breadcrumbs = [
    { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
    { "@type": "ListItem", position: 2, name: "Vans", item: absUrl("/vans") },
    { "@type": "ListItem", position: 3, name: "ULEZ compliant", item: absUrl("/vans/ulez") },
  ];

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "ULEZ-Compliant Vans for Sale",
        url: absUrl("/vans/ulez"),
        description: "ULEZ and Clean Air Zone exempt vans for sale in the UK.",
        breadcrumb: { "@type": "BreadcrumbList", itemListElement: breadcrumbs },
      }} />

      <section className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link>
            <span>/</span>
            <Link href="/vans" className="hover:text-ink-900">Vans</Link>
            <span>/</span>
            <span className="font-medium text-ink-700">ULEZ compliant</span>
          </nav>
          <Eyebrow>Clean air zones</Eyebrow>
          <h1 className="mt-2 font-display text-[var(--text-3xl)] font-extrabold leading-tight text-ink-900">
            ULEZ-compliant vans for sale
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--text-md)] text-ink-600">
            The Ultra Low Emission Zone (ULEZ) covers all of Greater London 24 hours a day. Vans that fail to meet Euro 6 (diesel) or Euro 3 (petrol) standards pay a daily charge. All electric vans are automatically exempt. Newer diesels from 2016 onwards generally qualify — but always verify against the official TfL checker before buying.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/vans?ulez=true" className="rounded-[var(--radius-pill)] bg-ink-900 px-5 py-2 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700">
              Browse {result.total > 0 ? `all ${result.total}` : ""} ULEZ-compliant vans →
            </Link>
            <Link href="/vans/electric" className="rounded-[var(--radius-pill)] border border-border bg-white px-5 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400">
              Electric vans (always exempt)
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {result.listings.length > 0 ? (
              <>
                <h2 className="mb-4 font-display text-[var(--text-xl)] font-bold text-ink-900">ULEZ-compliant vans in stock</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {result.listings.map((l, i) => <ListingCard key={l.id} listing={l} priority={i < 3} cardIndex={i} />)}
                </div>
                <div className="mt-6 text-center">
                  <Link href="/vans?ulez=true" className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-ink-900 px-6 py-3 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700">
                    View all {result.total} ULEZ-compliant vans →
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-[var(--text-sm)] text-ink-400">No ULEZ-compliant vans listed right now — check back soon.</p>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-[var(--radius-xl)] border border-border bg-white p-5">
              <h3 className="font-display text-[var(--text-base)] font-bold text-ink-900">ULEZ-exempt body types</h3>
              <ul className="mt-3 space-y-1.5">
                {[
                  ["ULEZ panel vans", "/vans?ulez=true&bodyStyle=Panel+Van"],
                  ["ULEZ Luton vans", "/vans?ulez=true&bodyStyle=Luton"],
                  ["ULEZ crew vans", "/vans?ulez=true&bodyStyle=Crew+Cab"],
                  ["ULEZ minibuses", "/vans?ulez=true&bodyStyle=Minibus"],
                  ["Electric vans (always exempt)", "/vans/electric"],
                ].map(([label, href]) => (
                  <li key={href as string}>
                    <Link href={href as string} className="text-[var(--text-sm)] text-brand-700 hover:underline">
                      {label} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[var(--radius-xl)] border border-border bg-white p-5">
              <h3 className="font-display text-[var(--text-base)] font-bold text-ink-900">ULEZ at a glance</h3>
              <ul className="mt-3 space-y-2 text-[var(--text-sm)] text-ink-600">
                <li>Diesel vans must meet <strong>Euro 6</strong> to be exempt</li>
                <li>Most diesels registered from <strong>September 2015</strong> onwards qualify</li>
                <li>All <strong>electric and hydrogen</strong> vans are automatically exempt</li>
                <li>Check your van at <span className="text-brand-700">tfl.gov.uk/modes/driving/check-your-vehicle</span></li>
              </ul>
            </div>
          </div>
        </div>
      </Container>

      {relatedBlog.length > 0 && (
        <section className="border-t border-border bg-surface-1 py-8">
          <Container>
            <div className="rounded-[var(--radius-xl)] border border-border bg-white p-5 md:max-w-sm">
              <RelatedLinks
                title="Related guides"
                links={relatedBlog.map((p) => ({ href: `/blog/${p.slug}`, label: p.title }))}
              />
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
