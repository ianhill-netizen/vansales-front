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
  title: "Used Vans for Sale",
  description: "Browse used vans for sale across the UK. Thousands of pre-owned panel vans, tippers, Lutons and crew vans from dealers and private sellers. Filter by make, price and mileage.",
  alternates: { canonical: absUrl("/vans/used") },
  openGraph: {
    title: `Used Vans for Sale · ${SITE.name}`,
    description: "Thousands of used vans from dealers and private sellers across the UK.",
    url: absUrl("/vans/used"),
    type: "website",
  },
};

export default async function UsedVansPage() {
  const result = await getListings({ condition: "used", pageSize: 6 });
  const relatedBlog = matchBlogPosts(getBlogIndex(), ["used", "no vat", "leasing", "finance", "self-employed"], undefined, 3);

  const breadcrumbs = [
    { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
    { "@type": "ListItem", position: 2, name: "Vans", item: absUrl("/vans") },
    { "@type": "ListItem", position: 3, name: "Used vans", item: absUrl("/vans/used") },
  ];

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Used Vans for Sale",
        url: absUrl("/vans/used"),
        description: "Pre-owned vans for sale in the UK from dealers and private sellers.",
        breadcrumb: { "@type": "BreadcrumbList", itemListElement: breadcrumbs },
      }} />

      <section className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link>
            <span>/</span>
            <Link href="/vans" className="hover:text-ink-900">Vans</Link>
            <span>/</span>
            <span className="font-medium text-ink-700">Used vans</span>
          </nav>
          <Eyebrow>Condition</Eyebrow>
          <h1 className="mt-2 font-display text-[var(--text-3xl)] font-extrabold leading-tight text-ink-900">
            Used vans for sale
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--text-md)] text-ink-600">
            Pre-owned commercial vehicles offer outstanding value — buy more van for your budget, avoid the new-van depreciation hit, and get into work straight away. Stock ranges from approved used with warranty to trade-in vehicles priced to sell.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/vans?condition=used" className="rounded-[var(--radius-pill)] bg-ink-900 px-5 py-2 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700">
              Browse {result.total > 0 ? `all ${result.total}` : ""} used vans →
            </Link>
            <Link href="/vans?condition=used&sort=price_asc" className="rounded-[var(--radius-pill)] border border-border bg-white px-5 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400">
              Cheapest first
            </Link>
            <Link href="/vans?condition=used&sort=mileage_asc" className="rounded-[var(--radius-pill)] border border-border bg-white px-5 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400">
              Lowest mileage
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {result.listings.length > 0 ? (
              <>
                <h2 className="mb-4 font-display text-[var(--text-xl)] font-bold text-ink-900">Used vans in stock</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {result.listings.map((l, i) => <ListingCard key={l.id} listing={l} priority={i < 3} cardIndex={i} />)}
                </div>
                <div className="mt-6 text-center">
                  <Link href="/vans?condition=used" className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-ink-900 px-6 py-3 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700">
                    View all {result.total} used vans →
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-[var(--text-sm)] text-ink-400">No used vans in stock right now — check back soon or browse new vans.</p>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-[var(--radius-xl)] border border-border bg-white p-5">
              <h3 className="font-display text-[var(--text-base)] font-bold text-ink-900">Browse by body type</h3>
              <ul className="mt-3 space-y-1.5">
                {[
                  ["Used panel vans", "/vans?condition=used&bodyStyle=Panel+Van"],
                  ["Used Luton vans", "/vans?condition=used&bodyStyle=Luton"],
                  ["Used tippers", "/vans?condition=used&bodyStyle=Tipper"],
                  ["Used crew vans", "/vans?condition=used&bodyStyle=Crew+Cab"],
                  ["Used pickups", "/vans?condition=used&bodyStyle=Pickup"],
                  ["Used minibuses", "/vans?condition=used&bodyStyle=Minibus"],
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
              <h3 className="font-display text-[var(--text-base)] font-bold text-ink-900">Browse by budget</h3>
              <ul className="mt-3 space-y-1.5">
                {[
                  ["Under £5,000", "/vans?condition=used&maxPrice=5000"],
                  ["£5,000 – £10,000", "/vans?condition=used&minPrice=5000&maxPrice=10000"],
                  ["£10,000 – £20,000", "/vans?condition=used&minPrice=10000&maxPrice=20000"],
                  ["Over £20,000", "/vans?condition=used&minPrice=20000"],
                ].map(([label, href]) => (
                  <li key={href as string}>
                    <Link href={href as string} className="text-[var(--text-sm)] text-brand-700 hover:underline">
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
