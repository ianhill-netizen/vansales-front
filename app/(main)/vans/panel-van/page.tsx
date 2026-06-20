import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";
import { ListingCard } from "@/components/listing-card";
import { JsonLd } from "@/components/json-ld";
import { getListings } from "@/lib/listings/client";
import { SITE, absUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Panel Vans for Sale",
  description: "Browse panel vans for sale across the UK. All sizes from compact city vans to high-roof LWB panel vans. Filter by make, price and wheelbase.",
  alternates: { canonical: absUrl("/vans/panel-van") },
  openGraph: {
    title: `Panel Vans for Sale · ${SITE.name}`,
    description: "Browse panel vans for sale across the UK.",
    url: absUrl("/vans/panel-van"),
    type: "website",
  },
};

export default async function PanelVanCategoryPage() {
  const result = await getListings({ bodyStyle: "Panel Van", pageSize: 6 });

  const breadcrumbs = [
    { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
    { "@type": "ListItem", position: 2, name: "Vans", item: absUrl("/vans") },
    { "@type": "ListItem", position: 3, name: "Panel vans", item: absUrl("/vans/panel-van") },
  ];

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Panel Vans for Sale",
        url: absUrl("/vans/panel-van"),
        description: "Panel vans for sale in the UK — all makes, sizes and wheelbases.",
        breadcrumb: { "@type": "BreadcrumbList", itemListElement: breadcrumbs },
      }} />

      <section className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link>
            <span>/</span>
            <Link href="/vans" className="hover:text-ink-900">Vans</Link>
            <span>/</span>
            <span className="font-medium text-ink-700">Panel vans</span>
          </nav>
          <Eyebrow>Body type</Eyebrow>
          <h1 className="mt-2 font-display text-[var(--text-3xl)] font-extrabold leading-tight text-ink-900">
            Panel vans for sale
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--text-md)] text-ink-600">
            The workhorse of the van world. Panel vans offer an enclosed load area, low running costs and year-round weather protection for your cargo. Available in short, medium and long wheelbase with low, medium and high roof options.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/vans?bodyStyle=Panel+Van" className="rounded-[var(--radius-pill)] bg-ink-900 px-5 py-2 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700">
              Browse {result.total > 0 ? `all ${result.total}` : ""} panel vans →
            </Link>
            <Link href="/vans?bodyStyle=Panel+Van&condition=new" className="rounded-[var(--radius-pill)] border border-border bg-white px-5 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400">
              New panel vans
            </Link>
            <Link href="/vans?bodyStyle=Panel+Van&condition=used" className="rounded-[var(--radius-pill)] border border-border bg-white px-5 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400">
              Used panel vans
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {result.listings.length > 0 ? (
              <>
                <h2 className="mb-4 font-display text-[var(--text-xl)] font-bold text-ink-900">Latest panel vans</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {result.listings.map((l, i) => <ListingCard key={l.id} listing={l} priority={i < 3} cardIndex={i} />)}
                </div>
                <div className="mt-8 text-center">
                  <Link href="/vans?bodyStyle=Panel+Van" className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-ink-900 px-6 py-3 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700">
                    View all {result.total} panel vans →
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-[var(--text-sm)] text-ink-400">No panel vans in stock right now — check back soon.</p>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-[var(--radius-xl)] border border-border bg-white p-5">
              <h3 className="font-display text-[var(--text-base)] font-bold text-ink-900">Popular makes</h3>
              <ul className="mt-3 space-y-1.5">
                {[
                  ["Ford Transit", "/vans/ford"],
                  ["VW Transporter", "/vans/volkswagen"],
                  ["Mercedes-Benz Sprinter", "/vans/mercedes-benz"],
                  ["Vauxhall Vivaro", "/vans/vauxhall"],
                  ["Renault Master", "/vans/renault"],
                  ["Peugeot Expert", "/vans/peugeot"],
                  ["Citroën Dispatch", "/vans/citroen"],
                  ["Fiat Ducato", "/vans/fiat"],
                ].map(([label, href]) => (
                  <li key={href as string}>
                    <Link href={href as string} className="text-[var(--text-sm)] text-brand-700 hover:underline">
                      {label} panel vans →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[var(--radius-xl)] border border-border bg-white p-5">
              <h3 className="font-display text-[var(--text-base)] font-bold text-ink-900">Browse by size</h3>
              <ul className="mt-3 space-y-1.5">
                {[
                  ["Small / compact panel vans", "/vans?bodyStyle=Panel+Van&wheelbase=swb"],
                  ["Medium wheelbase panel vans", "/vans?bodyStyle=Panel+Van&wheelbase=mwb"],
                  ["Long wheelbase panel vans", "/vans?bodyStyle=Panel+Van&wheelbase=lwb"],
                  ["Electric panel vans", "/vans?bodyStyle=Panel+Van&fuel=electric"],
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
    </>
  );
}
