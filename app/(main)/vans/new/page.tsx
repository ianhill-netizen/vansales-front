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

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New Vans for Sale",
  description: "Browse brand new vans for sale in the UK. Full manufacturer warranty, latest spec and 0% finance deals available. Ford, Volkswagen, Mercedes-Benz, Vauxhall and more.",
  alternates: { canonical: absUrl("/vans/new") },
  openGraph: {
    title: `New Vans for Sale · ${SITE.name}`,
    description: "Brand new vans with manufacturer warranty and finance options.",
    url: absUrl("/vans/new"),
    type: "website",
  },
};

export default async function NewVansPage() {
  const result = await getListings({ condition: "new", pageSize: 6 });
  const relatedBlog = matchBlogPosts(getBlogIndex(), ["new van", "new deal", "0 finance", "deals", "2024", "2025"], undefined, 3);

  const breadcrumbs = [
    { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
    { "@type": "ListItem", position: 2, name: "Vans", item: absUrl("/vans") },
    { "@type": "ListItem", position: 3, name: "New vans", item: absUrl("/vans/new") },
  ];

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "New Vans for Sale",
        url: absUrl("/vans/new"),
        description: "Brand new vans with manufacturer warranty for sale in the UK.",
        breadcrumb: { "@type": "BreadcrumbList", itemListElement: breadcrumbs },
      }} />

      <section className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link>
            <span>/</span>
            <Link href="/vans" className="hover:text-ink-900">Vans</Link>
            <span>/</span>
            <span className="font-medium text-ink-700">New vans</span>
          </nav>
          <Eyebrow>Condition</Eyebrow>
          <h1 className="mt-2 font-display text-[var(--text-3xl)] font-extrabold leading-tight text-ink-900">
            New vans for sale
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--text-md)] text-ink-600">
            Brand new vans come with a full manufacturer warranty (typically 3–5 years), the latest technology and no hidden history. Many dealers offer 0% business finance, and electric new vans may qualify for government grants. Browse the full range below.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/vans?condition=new" className="rounded-[var(--radius-pill)] bg-ink-900 px-5 py-2 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700">
              Browse {result.total > 0 ? `all ${result.total}` : ""} new vans →
            </Link>
            <Link href="/vans/electric" className="rounded-[var(--radius-pill)] border border-border bg-white px-5 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400">
              New electric vans
            </Link>
            <Link href="/new-vans" className="rounded-[var(--radius-pill)] border border-border bg-white px-5 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400">
              Model guide
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {result.listings.length > 0 ? (
              <>
                <h2 className="mb-4 font-display text-[var(--text-xl)] font-bold text-ink-900">New vans in stock</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {result.listings.map((l, i) => <ListingCard key={l.id} listing={l} priority={i < 3} cardIndex={i} />)}
                </div>
                <div className="mt-6 text-center">
                  <Link href="/vans?condition=new" className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-ink-900 px-6 py-3 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700">
                    View all {result.total} new vans →
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-[var(--text-sm)] text-ink-400">No new vans in stock right now — check back soon or browse used vans.</p>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-[var(--radius-xl)] border border-border bg-white p-5">
              <h3 className="font-display text-[var(--text-base)] font-bold text-ink-900">Browse new by make</h3>
              <ul className="mt-3 space-y-1.5">
                {[
                  ["New Ford vans", "/vans/ford"],
                  ["New Volkswagen vans", "/vans/volkswagen"],
                  ["New Mercedes-Benz vans", "/vans/mercedes-benz"],
                  ["New Vauxhall vans", "/vans/vauxhall"],
                  ["New Renault vans", "/vans/renault"],
                  ["New Toyota vans", "/vans/toyota"],
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
              <h3 className="font-display text-[var(--text-base)] font-bold text-ink-900">New van model guide</h3>
              <ul className="mt-3 space-y-1.5">
                {[
                  ["Ford Transit Custom", "ford-transit-custom-lease"],
                  ["VW Transporter T7", "vw-t7-camper-for-sale"],
                  ["Mercedes Sprinter", "mercedes-sprinter-lease"],
                  ["Vauxhall Vivaro", "vauxhall-vivaro-lease"],
                  ["Renault Master", "renault-master-lease"],
                  ["All new van models →", ""],
                ].map(([label, slug]) => (
                  <li key={slug as string}>
                    <Link
                      href={slug ? `/new-vans/${slug}` : "/new-vans"}
                      className="text-[var(--text-sm)] text-brand-700 hover:underline"
                    >
                      {label} →
                    </Link>
                  </li>
                ))}
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
