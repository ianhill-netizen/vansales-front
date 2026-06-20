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
  title: "Luton Vans for Sale",
  description: "Browse Luton box vans for sale. High cube volume, tail-lift options, ideal for removals and furniture delivery. Ford, Mercedes, Renault, Iveco and more.",
  alternates: { canonical: absUrl("/vans/luton") },
  openGraph: {
    title: `Luton Vans for Sale · ${SITE.name}`,
    description: "Browse Luton box vans for sale across the UK.",
    url: absUrl("/vans/luton"),
    type: "website",
  },
};

export default async function LutonCategoryPage() {
  const result = await getListings({ bodyStyle: "Luton", pageSize: 6 });
  const relatedBlog = matchBlogPosts(getBlogIndex(), ["luton", "box van", "removal", "tail-lift", "tail lift"], undefined, 3);

  const breadcrumbs = [
    { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
    { "@type": "ListItem", position: 2, name: "Vans", item: absUrl("/vans") },
    { "@type": "ListItem", position: 3, name: "Luton vans", item: absUrl("/vans/luton") },
  ];

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Luton Vans for Sale",
        url: absUrl("/vans/luton"),
        description: "Luton box vans for sale in the UK.",
        breadcrumb: { "@type": "BreadcrumbList", itemListElement: breadcrumbs },
      }} />

      <section className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link>
            <span>/</span>
            <Link href="/vans" className="hover:text-ink-900">Vans</Link>
            <span>/</span>
            <span className="font-medium text-ink-700">Luton vans</span>
          </nav>
          <Eyebrow>Body type</Eyebrow>
          <h1 className="mt-2 font-display text-[var(--text-3xl)] font-extrabold leading-tight text-ink-900">
            Luton vans for sale
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--text-md)] text-ink-600">
            Luton box vans offer the highest cubic load capacity of any van body type, making them the go-to choice for removals, furniture delivery and logistics. Often fitted with a tail-lift for easy loading without a dock.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/vans?bodyStyle=Luton" className="rounded-[var(--radius-pill)] bg-ink-900 px-5 py-2 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700">
              Browse {result.total > 0 ? `all ${result.total}` : ""} Luton vans →
            </Link>
            <Link href="/vans?bodyStyle=Luton&condition=used" className="rounded-[var(--radius-pill)] border border-border bg-white px-5 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400">
              Used Luton vans
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {result.listings.length > 0 ? (
              <>
                <h2 className="mb-4 font-display text-[var(--text-xl)] font-bold text-ink-900">Latest Luton vans</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {result.listings.map((l, i) => <ListingCard key={l.id} listing={l} priority={i < 3} cardIndex={i} />)}
                </div>
                <div className="mt-8 text-center">
                  <Link href="/vans?bodyStyle=Luton" className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-ink-900 px-6 py-3 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700">
                    View all {result.total} Luton vans →
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-[var(--text-sm)] text-ink-400">No Luton vans in stock right now — check back soon.</p>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-[var(--radius-xl)] border border-border bg-white p-5">
              <h3 className="font-display text-[var(--text-base)] font-bold text-ink-900">New Luton models</h3>
              <ul className="mt-3 space-y-1.5">
                {[
                  ["Fiat Ducato Luton", "fiat-ducato-luton"],
                  ["Ford Transit Luton", "ford-transit-luton"],
                  ["Iveco Daily Luton", "iveco-daily-luton-van"],
                  ["Mercedes Luton Van", "mercedes-luton-van"],
                  ["Mercedes Sprinter Luton", "mercedes-sprinter-luton-rental"],
                  ["Renault Master Luton", "renault-master-luton"],
                  ["VW Crafter Luton", "vw-crafter-luton"],
                ].map(([label, slug]) => (
                  <li key={slug as string}>
                    <Link href={`/new-vans/${slug}`} className="text-[var(--text-sm)] text-brand-700 hover:underline">
                      {label} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[var(--radius-xl)] border border-border bg-white p-5">
              <h3 className="font-display text-[var(--text-base)] font-bold text-ink-900">Related body types</h3>
              <ul className="mt-3 space-y-1.5">
                {[
                  ["Tipper vans", "/vans/tipper"],
                  ["Dropside vans", "/vans/dropside"],
                  ["Chassis cab vans", "/vans/chassis-cab"],
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

      <section className="border-t border-border bg-surface-1 py-8">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[var(--radius-xl)] border border-border bg-white p-5">
              <RelatedLinks
                title="Related body types"
                links={[
                  { href: "/vans/tipper", label: "Tipper vans" },
                  { href: "/vans/dropside", label: "Dropside vans" },
                  { href: "/vans/chassis-cab", label: "Chassis cabs" },
                  { href: "/vans/panel-van", label: "Panel vans" },
                ]}
                variant="pills"
              />
            </div>
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
