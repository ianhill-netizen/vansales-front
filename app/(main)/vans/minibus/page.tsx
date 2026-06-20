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

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Minibuses & People Carriers for Sale",
  description: "Browse minibuses and people carriers for sale in the UK. 9-17 seat configurations, wheelchair accessible, school and private hire. Ford Tourneo, Iveco Daily, VW Transporter Kombi and more.",
  alternates: { canonical: absUrl("/vans/minibus") },
  openGraph: {
    title: `Minibuses for Sale · ${SITE.name}`,
    description: "New and used minibuses in stock. 9 to 17 seats, private hire and accessible models.",
    url: absUrl("/vans/minibus"),
    type: "website",
  },
};

export default async function MinibusCategoryPage() {
  const result = await getListings({ bodyStyle: "Minibus", pageSize: 6 });
  const relatedBlog = matchBlogPosts(getBlogIndex(), ["minibus", "tourneo", "people carrier", "transit custom"], undefined, 3);

  const breadcrumbs = [
    { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
    { "@type": "ListItem", position: 2, name: "Vans", item: absUrl("/vans") },
    { "@type": "ListItem", position: 3, name: "Minibuses", item: absUrl("/vans/minibus") },
  ];

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Minibuses for Sale",
        url: absUrl("/vans/minibus"),
        description: "Browse minibuses and people carriers for sale in the UK.",
        breadcrumb: { "@type": "BreadcrumbList", itemListElement: breadcrumbs },
      }} />

      <section className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link>
            <span>/</span>
            <Link href="/vans" className="hover:text-ink-900">Vans</Link>
            <span>/</span>
            <span className="font-medium text-ink-700">Minibuses</span>
          </nav>
          <Eyebrow>Body type</Eyebrow>
          <h1 className="mt-2 font-display text-[var(--text-3xl)] font-extrabold leading-tight text-ink-900">
            Minibuses for sale
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--text-md)] text-ink-600">
            From 9-seat people carriers to 17-seat coaches, minibuses serve schools, care homes, private hire operators and community groups. Many come in wheelchair-accessible (WAV) configurations. Popular models include the Ford Tourneo Custom, Iveco Daily Minibus and VW Transporter Kombi.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/vans?bodyStyle=Minibus" className="rounded-[var(--radius-pill)] bg-ink-900 px-5 py-2 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700">
              Browse {result.total > 0 ? `all ${result.total}` : ""} minibuses →
            </Link>
            <Link href="/vans?bodyStyle=Minibus&condition=used" className="rounded-[var(--radius-pill)] border border-border bg-white px-5 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400">
              Used minibuses
            </Link>
            <Link href="/vans?bodyStyle=Minibus&condition=new" className="rounded-[var(--radius-pill)] border border-border bg-white px-5 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400">
              New minibuses
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {result.listings.length > 0 ? (
              <>
                <h2 className="mb-4 font-display text-[var(--text-xl)] font-bold text-ink-900">Latest minibuses in stock</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {result.listings.map((l, i) => <ListingCard key={l.id} listing={l} priority={i < 3} cardIndex={i} />)}
                </div>
                <div className="mt-6 text-center">
                  <Link href="/vans?bodyStyle=Minibus" className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-ink-900 px-6 py-3 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700">
                    View all {result.total} minibuses →
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-[var(--text-sm)] text-ink-400">No minibuses in stock right now — check back soon or browse all vans.</p>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-[var(--radius-xl)] border border-border bg-white p-5">
              <h3 className="font-display text-[var(--text-base)] font-bold text-ink-900">Popular minibus models</h3>
              <ul className="mt-3 space-y-1.5">
                {[
                  ["Ford Tourneo Custom Minibus", "ford-tourneo-custom-minibus-lease"],
                  ["Iveco Daily Minibus", "iveco-daily-minibus"],
                  ["VW Transporter Kombi", "vw-transporter-kombi-lease"],
                  ["Ford Transit Minibus", "ford-transit-custom-lease"],
                  ["Peugeot Traveller", "peugeot-expert-crew-cab"],
                  ["Renault Trafic Combi", "renault-trafic-lease"],
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
              <h3 className="font-display text-[var(--text-base)] font-bold text-ink-900">Browse by use</h3>
              <ul className="mt-3 space-y-1.5">
                {[
                  ["Wheelchair accessible (WAV)", "/vans?bodyStyle=Minibus&q=wheelchair"],
                  ["School minibus", "/vans?bodyStyle=Minibus&q=school"],
                  ["Private hire / taxi", "/vans?bodyStyle=Minibus&q=hire"],
                  ["All minibuses", "/vans?bodyStyle=Minibus"],
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
                  { href: "/vans/crew-van", label: "Crew vans" },
                  { href: "/vans/panel-van", label: "Panel vans" },
                  { href: "/vans/electric", label: "Electric vans" },
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
