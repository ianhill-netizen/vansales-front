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
  title: "Electric Vans for Sale",
  description: "Browse electric vans for sale in the UK. Zero-emission panel vans, crew vans and pickups. Ford E-Transit, VW e-Crafter, Citroën ë-Berlingo and more. ULEZ-exempt, low running costs.",
  alternates: { canonical: absUrl("/vans/electric") },
  openGraph: {
    title: `Electric Vans for Sale · ${SITE.name}`,
    description: "New and used electric vans in stock. Zero-emission, ULEZ exempt, low running costs.",
    url: absUrl("/vans/electric"),
    type: "website",
  },
};

export default async function ElectricVansPage() {
  const result = await getListings({ fuel: "electric", pageSize: 6 });
  const relatedBlog = matchBlogPosts(getBlogIndex(), ["electric", "ev", "id buzz", "e-transit", "zero emission", "charging"], undefined, 3);

  const breadcrumbs = [
    { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
    { "@type": "ListItem", position: 2, name: "Vans", item: absUrl("/vans") },
    { "@type": "ListItem", position: 3, name: "Electric vans", item: absUrl("/vans/electric") },
  ];

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Electric Vans for Sale",
        url: absUrl("/vans/electric"),
        description: "Zero-emission electric vans for sale in the UK.",
        breadcrumb: { "@type": "BreadcrumbList", itemListElement: breadcrumbs },
      }} />

      <section className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link>
            <span>/</span>
            <Link href="/vans" className="hover:text-ink-900">Vans</Link>
            <span>/</span>
            <span className="font-medium text-ink-700">Electric vans</span>
          </nav>
          <Eyebrow>Fuel type</Eyebrow>
          <h1 className="mt-2 font-display text-[var(--text-3xl)] font-extrabold leading-tight text-ink-900">
            Electric vans for sale
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--text-md)] text-ink-600">
            Electric vans deliver zero tailpipe emissions, lower running costs and exemption from ULEZ and Clean Air Zone charges. Modern ranges of 100–200 miles suit most urban delivery and trade routes. Choose from pure BEV panel vans, crew vans and small vans — or a plug-in hybrid for mixed duty cycles.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/vans?fuel=electric" className="rounded-[var(--radius-pill)] bg-ink-900 px-5 py-2 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700">
              Browse {result.total > 0 ? `all ${result.total}` : ""} electric vans →
            </Link>
            <Link href="/vans/ulez" className="rounded-[var(--radius-pill)] border border-border bg-white px-5 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400">
              All ULEZ-compliant vans
            </Link>
            <Link href="/vans/new" className="rounded-[var(--radius-pill)] border border-border bg-white px-5 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400">
              New vans
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {result.listings.length > 0 ? (
              <>
                <h2 className="mb-4 font-display text-[var(--text-xl)] font-bold text-ink-900">Electric vans in stock</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {result.listings.map((l, i) => <ListingCard key={l.id} listing={l} priority={i < 3} cardIndex={i} />)}
                </div>
                <div className="mt-6 text-center">
                  <Link href="/vans?fuel=electric" className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-ink-900 px-6 py-3 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700">
                    View all {result.total} electric vans →
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-[var(--text-sm)] text-ink-400">No electric vans in stock right now — check back soon or browse all vans.</p>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-[var(--radius-xl)] border border-border bg-white p-5">
              <h3 className="font-display text-[var(--text-base)] font-bold text-ink-900">Popular electric models</h3>
              <ul className="mt-3 space-y-1.5">
                {[
                  ["Ford E-Transit", "ford-e-transit"],
                  ["Ford E-Transit Custom", "ford-e-transit-custom"],
                  ["Ford E-Transit Courier", "ford-e-transit-courier"],
                  ["Citroën ë-Berlingo", "citroen-e-berlingo"],
                  ["VW Crafter Electric", "vw-crafter-lease"],
                  ["Renault Kangoo E-Tech", "renault-kangoo-lease"],
                ].map(([label, slug]) => (
                  <li key={slug}>
                    <Link href={`/new-vans/${slug}`} className="text-[var(--text-sm)] text-brand-700 hover:underline">
                      {label} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[var(--radius-xl)] border border-border bg-white p-5">
              <h3 className="font-display text-[var(--text-base)] font-bold text-ink-900">Also consider</h3>
              <ul className="mt-3 space-y-1.5">
                {[
                  ["All ULEZ-compliant vans", "/vans/ulez"],
                  ["Plug-in hybrids (PHEV)", "/vans?fuel=plug-in+hybrid"],
                  ["New vans", "/vans/new"],
                  ["Electric panel vans", "/vans?fuel=electric&bodyStyle=Panel+Van"],
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
