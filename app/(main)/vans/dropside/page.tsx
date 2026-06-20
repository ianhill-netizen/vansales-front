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
  title: "Dropside Vans for Sale",
  description: "Browse dropside vans for sale. Open flat-bed body with fold-down sides for easy side loading. Perfect for plant hire, builders and landscapers.",
  alternates: { canonical: absUrl("/vans/dropside") },
  openGraph: {
    title: `Dropside Vans for Sale · ${SITE.name}`,
    description: "Browse dropside vans for sale across the UK.",
    url: absUrl("/vans/dropside"),
    type: "website",
  },
};

export default async function DropsideCategoryPage() {
  const result = await getListings({ bodyStyle: "Dropside", pageSize: 6 });
  const relatedBlog = matchBlogPosts(getBlogIndex(), ["dropside", "flatbed", "tipper", "chassis", "platform"], undefined, 3);

  const breadcrumbs = [
    { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
    { "@type": "ListItem", position: 2, name: "Vans", item: absUrl("/vans") },
    { "@type": "ListItem", position: 3, name: "Dropside vans", item: absUrl("/vans/dropside") },
  ];

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Dropside Vans for Sale",
        url: absUrl("/vans/dropside"),
        description: "Dropside vans for sale in the UK.",
        breadcrumb: { "@type": "BreadcrumbList", itemListElement: breadcrumbs },
      }} />

      <section className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link>
            <span>/</span>
            <Link href="/vans" className="hover:text-ink-900">Vans</Link>
            <span>/</span>
            <span className="font-medium text-ink-700">Dropside vans</span>
          </nav>
          <Eyebrow>Body type</Eyebrow>
          <h1 className="mt-2 font-display text-[var(--text-3xl)] font-extrabold leading-tight text-ink-900">
            Dropside vans for sale
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--text-md)] text-ink-600">
            Dropside vans combine the manoeuvrability of a van cab with an open flat-bed platform body whose sides fold down for unrestricted side-loading. Ideal for palletised goods, scaffolding, timber, machinery and anything that won&apos;t fit through van doors.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/vans?bodyStyle=Dropside" className="rounded-[var(--radius-pill)] bg-ink-900 px-5 py-2 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700">
              Browse {result.total > 0 ? `all ${result.total}` : ""} dropsides →
            </Link>
            <Link href="/vans?bodyStyle=Dropside&condition=used" className="rounded-[var(--radius-pill)] border border-border bg-white px-5 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400">
              Used dropsides
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {result.listings.length > 0 ? (
              <>
                <h2 className="mb-4 font-display text-[var(--text-xl)] font-bold text-ink-900">Latest dropsides</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {result.listings.map((l, i) => <ListingCard key={l.id} listing={l} priority={i < 3} cardIndex={i} />)}
                </div>
                <div className="mt-8 text-center">
                  <Link href="/vans?bodyStyle=Dropside" className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-ink-900 px-6 py-3 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700">
                    View all {result.total} dropsides →
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-[var(--text-sm)] text-ink-400">No dropsides in stock right now — check back soon.</p>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-[var(--radius-xl)] border border-border bg-white p-5">
              <h3 className="font-display text-[var(--text-base)] font-bold text-ink-900">Related body types</h3>
              <p className="mt-2 text-[var(--text-sm)] text-ink-500">Dropsides are built to order on chassis cabs — browse the related types below.</p>
              <ul className="mt-3 space-y-1.5">
                {[
                  ["Chassis cab vans", "/vans/chassis-cab"],
                  ["Tipper vans", "/vans/tipper"],
                  ["Luton vans", "/vans/luton"],
                  ["Pickup trucks", "/vans/pickup"],
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
              <h3 className="font-display text-[var(--text-base)] font-bold text-ink-900">Popular dropside bases</h3>
              <ul className="mt-3 space-y-1.5">
                {[
                  ["Ford Transit Dropside", "/vans?bodyStyle=Dropside&q=Ford"],
                  ["Mercedes Sprinter Dropside", "/vans?bodyStyle=Dropside&q=Mercedes"],
                  ["Iveco Daily Dropside", "/vans?bodyStyle=Dropside&q=Iveco"],
                  ["Renault Master Dropside", "/vans?bodyStyle=Dropside&q=Renault"],
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
                  { href: "/vans/luton", label: "Luton vans" },
                  { href: "/vans/chassis-cab", label: "Chassis cabs" },
                  { href: "/vans/pickup", label: "Pickup trucks" },
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
