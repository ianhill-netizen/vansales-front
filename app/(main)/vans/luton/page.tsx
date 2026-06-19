import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";
import { ListingCard } from "@/components/listing-card";
import { getListings } from "@/lib/listings/client";
import { SITE, absUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Luton Vans for Sale",
  description: "Browse Luton box vans for sale. High cube volume, tail-lift options, ideal for removals and furniture delivery. All makes and prices.",
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

  return (
    <>
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
            <Link
              href="/vans?bodyStyle=Luton"
              className="rounded-[var(--radius-pill)] bg-ink-900 px-5 py-2 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700"
            >
              Browse {result.total > 0 ? `all ${result.total}` : ""} Luton vans →
            </Link>
            <Link
              href="/vans?bodyStyle=Luton&condition=used"
              className="rounded-[var(--radius-pill)] border border-border bg-white px-5 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400"
            >
              Used Luton vans
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-10">
        {result.listings.length > 0 && (
          <>
            <h2 className="mb-4 font-display text-[var(--text-xl)] font-bold text-ink-900">Latest Luton vans</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {result.listings.map((l, i) => (
                <ListingCard key={l.id} listing={l} priority={i < 3} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/vans?bodyStyle=Luton"
                className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-ink-900 px-6 py-3 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700"
              >
                View all {result.total} Luton vans
              </Link>
            </div>
          </>
        )}

        <div className="mt-12 rounded-[var(--radius-xl)] border border-border bg-card p-6">
          <h3 className="font-display text-[var(--text-lg)] font-bold text-ink-900">Popular Luton van makes</h3>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {["Ford Transit Luton", "Renault Master Luton", "Mercedes-Benz Sprinter Luton", "Iveco Daily Luton", "Vauxhall Movano Luton", "Fiat Ducato Luton"].map((m) => (
              <li key={m}>
                <Link href={`/vans?bodyStyle=Luton&q=${encodeURIComponent(m)}`} className="text-[var(--text-sm)] text-brand-700 hover:underline">
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
