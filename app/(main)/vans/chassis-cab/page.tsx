import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";
import { ListingCard } from "@/components/listing-card";
import { JsonLd } from "@/components/json-ld";
import { getListings } from "@/lib/listings/client";
import { SITE, absUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Chassis Cab Vans for Sale",
  description: "Chassis cab vans for specialist conversions — dropsides, tippers, curtainsiders, box bodies and more. Single and double cab. Ford Transit, Mercedes Sprinter, Iveco Daily in stock.",
  alternates: { canonical: absUrl("/vans/chassis-cab") },
  openGraph: {
    title: `Chassis Cab Vans for Sale · ${SITE.name}`,
    description: "Chassis cabs for specialist conversions. All makes and sizes.",
    url: absUrl("/vans/chassis-cab"),
    type: "website",
  },
};

export default async function ChassisCabPage() {
  const result = await getListings({ bodyStyle: "Chassis Cab", pageSize: 6 });

  const breadcrumbs = [
    { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
    { "@type": "ListItem", position: 2, name: "Vans", item: absUrl("/vans") },
    { "@type": "ListItem", position: 3, name: "Chassis cabs", item: absUrl("/vans/chassis-cab") },
  ];

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Chassis Cab Vans for Sale",
        url: absUrl("/vans/chassis-cab"),
        description: "Chassis cab vans for specialist conversions.",
        breadcrumb: { "@type": "BreadcrumbList", itemListElement: breadcrumbs },
      }} />

      <section className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link>
            <span>/</span>
            <Link href="/vans" className="hover:text-ink-900">Vans</Link>
            <span>/</span>
            <span className="font-medium text-ink-700">Chassis cabs</span>
          </nav>
          <Eyebrow>Body type</Eyebrow>
          <h1 className="mt-2 font-display text-[var(--text-3xl)] font-extrabold leading-tight text-ink-900">
            Chassis cab vans for sale
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--text-md)] text-ink-600">
            A chassis cab is the base for specialist bodywork — dropsides, tippers, curtainsiders, horsebox conversions, box bodies and refrigerated units. The cab-forward design maximises payload whilst keeping the GVW at 3.5t. Popular chassis: Ford Transit, Mercedes Sprinter, Iveco Daily and Renault Master.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/vans?bodyStyle=Chassis+Cab" className="rounded-[var(--radius-pill)] bg-ink-900 px-5 py-2 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700">
              Browse {result.total > 0 ? `all ${result.total}` : ""} chassis cabs →
            </Link>
            <Link href="/vans/tipper" className="rounded-[var(--radius-pill)] border border-border bg-white px-5 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400">
              Tipper conversions →
            </Link>
            <Link href="/vans/dropside" className="rounded-[var(--radius-pill)] border border-border bg-white px-5 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400">
              Dropside conversions →
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-10">
        {result.listings.length > 0 ? (
          <>
            <h2 className="mb-4 font-display text-[var(--text-xl)] font-bold text-ink-900">Chassis cabs in stock</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {result.listings.map((l, i) => <ListingCard key={l.id} listing={l} priority={i < 3} />)}
            </div>
            <div className="mt-6 text-center">
              <Link href="/vans?bodyStyle=Chassis+Cab" className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-ink-900 px-6 py-3 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700">
                View all {result.total} chassis cabs →
              </Link>
            </div>
          </>
        ) : (
          <div className="py-6">
            <p className="text-[var(--text-sm)] text-ink-500">No chassis cabs listed right now. Browse related categories:</p>
            <div className="mt-4 flex gap-3">
              <Link href="/vans/tipper" className="rounded-[var(--radius-md)] border border-border px-4 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-brand-500">Tippers</Link>
              <Link href="/vans/dropside" className="rounded-[var(--radius-md)] border border-border px-4 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-brand-500">Dropsides</Link>
              <Link href="/vans/luton" className="rounded-[var(--radius-md)] border border-border px-4 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-brand-500">Lutons</Link>
            </div>
          </div>
        )}

        <div className="mt-10 rounded-[var(--radius-xl)] border border-border bg-white p-6">
          <h3 className="font-display text-[var(--text-lg)] font-bold text-ink-900">Popular chassis cab models</h3>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {["Ford Transit Chassis Cab", "Mercedes-Benz Sprinter Chassis Cab", "Iveco Daily Chassis Cab", "Renault Master Chassis Cab", "Vauxhall Movano Chassis Cab", "Peugeot Boxer Chassis Cab"].map((m) => (
              <li key={m}>
                <Link href={`/vans?bodyStyle=Chassis+Cab&q=${encodeURIComponent(m)}`} className="text-[var(--text-sm)] text-brand-700 hover:underline">
                  {m} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </>
  );
}
