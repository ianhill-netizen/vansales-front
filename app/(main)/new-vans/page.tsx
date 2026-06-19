import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Container, Eyebrow } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { getNewVanIndex, groupByMake } from "@/lib/content/new-vans";
import { SITE, absUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "New Vans — Models, Specs & Deals",
  description: "Browse every new van model available in the UK. Specs, engine options, payload capacity, and live stock links. Ford, VW, Mercedes, Citroën, Vauxhall and more.",
  alternates: { canonical: absUrl("/new-vans") },
  openGraph: {
    title: `New Vans — Models, Specs & Deals · ${SITE.name}`,
    description: "Every new van model available in the UK with full specs and live stock.",
    url: absUrl("/new-vans"),
    type: "website",
  },
};

export default function NewVansIndexPage() {
  const entries = getNewVanIndex();
  const byMake = groupByMake(entries);
  const makes = Object.keys(byMake).sort();

  const breadcrumbs = [
    { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
    { "@type": "ListItem", position: 2, name: "New vans", item: absUrl("/new-vans") },
  ];

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "New Van Models",
        url: absUrl("/new-vans"),
        description: "Browse every new van model available in the UK.",
        breadcrumb: { "@type": "BreadcrumbList", itemListElement: breadcrumbs },
      }} />

      <section className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link>
            <span>/</span>
            <span className="font-medium text-ink-700">New vans</span>
          </nav>
          <Eyebrow>Model guide</Eyebrow>
          <h1 className="mt-2 font-display text-[var(--text-3xl)] font-extrabold leading-tight text-ink-900">
            New van models
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--text-md)] text-ink-600">
            Full specs, engine options, and payload capacity for every major new van available in the UK — with direct links to live Dealski stock.
          </p>
          <p className="mt-2 text-[var(--text-sm)] text-ink-400">{entries.length} models across {makes.length} manufacturers</p>
        </Container>
      </section>

      <Container className="py-10">
        <div className="space-y-12">
          {makes.map((make) => (
            <section key={make}>
              <h2 className="mb-5 border-b border-border pb-2 font-display text-[var(--text-xl)] font-bold text-ink-900">
                {make} vans
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {byMake[make].map((van) => (
                  <Link
                    key={van.slug}
                    href={`/new-vans/${van.slug}`}
                    className="group flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-sm)] transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
                  >
                    <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-brand-50 to-surface-1 px-4">
                      {van.heroImage ? (
                        <Image
                          src={van.heroImage}
                          alt={`${van.title} image`}
                          fill
                          className="object-contain p-3"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="text-5xl opacity-20">🚐</div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <p className="text-[var(--text-xs)] font-semibold uppercase tracking-wider text-ink-400">{van.make}</p>
                      <h3 className="mt-0.5 font-display text-[var(--text-base)] font-bold text-ink-900 group-hover:text-brand-700">
                        {van.model}
                      </h3>
                      {van.description && (
                        <p className="mt-1.5 line-clamp-2 text-[var(--text-xs)] leading-relaxed text-ink-500">
                          {van.description}
                        </p>
                      )}
                      <span className="mt-3 text-[var(--text-xs)] font-semibold text-brand-700 group-hover:underline">
                        Specs &amp; stock →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
