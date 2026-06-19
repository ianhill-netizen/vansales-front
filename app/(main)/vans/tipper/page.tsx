import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";
import { ListingCard } from "@/components/listing-card";
import { getListings } from "@/lib/listings/client";
import { SITE, absUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tipper Vans for Sale",
  description: "Browse tipper vans and trucks for sale. Single and double-axle tippers for landscaping, waste removal, construction and agriculture.",
  alternates: { canonical: absUrl("/vans/tipper") },
  openGraph: {
    title: `Tipper Vans for Sale · ${SITE.name}`,
    description: "Browse tipper vans and trucks for sale across the UK.",
    url: absUrl("/vans/tipper"),
    type: "website",
  },
};

export default async function TipperCategoryPage() {
  const result = await getListings({ bodyStyle: "Tipper", pageSize: 6 });

  return (
    <>
      <section className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link>
            <span>/</span>
            <Link href="/vans" className="hover:text-ink-900">Vans</Link>
            <span>/</span>
            <span className="font-medium text-ink-700">Tipper vans</span>
          </nav>
          <Eyebrow>Body type</Eyebrow>
          <h1 className="mt-2 font-display text-[var(--text-3xl)] font-extrabold leading-tight text-ink-900">
            Tipper vans for sale
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--text-md)] text-ink-600">
            Tippers are built for heavy-duty loose loads — aggregate, soil, spoil and green waste. A hydraulic tipping body makes unloading fast and effortless. Ideal for groundworkers, landscapers, waste contractors and farmers.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/vans?bodyStyle=Tipper"
              className="rounded-[var(--radius-pill)] bg-ink-900 px-5 py-2 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700"
            >
              Browse {result.total > 0 ? `all ${result.total}` : ""} tippers →
            </Link>
            <Link
              href="/vans?bodyStyle=Tipper&condition=used"
              className="rounded-[var(--radius-pill)] border border-border bg-white px-5 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400"
            >
              Used tippers
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-10">
        {result.listings.length > 0 && (
          <>
            <h2 className="mb-4 font-display text-[var(--text-xl)] font-bold text-ink-900">Latest tippers</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {result.listings.map((l, i) => (
                <ListingCard key={l.id} listing={l} priority={i < 3} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/vans?bodyStyle=Tipper"
                className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-ink-900 px-6 py-3 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700"
              >
                View all {result.total} tippers
              </Link>
            </div>
          </>
        )}

        <div className="mt-12 rounded-[var(--radius-xl)] border border-border bg-card p-6">
          <h3 className="font-display text-[var(--text-lg)] font-bold text-ink-900">Popular tipper makes</h3>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {["Ford Ranger Tipper", "Mitsubishi L200 Tipper", "Toyota Hilux Tipper", "Ford Transit Tipper", "Isuzu D-Max Tipper", "Renault Master Tipper"].map((m) => (
              <li key={m}>
                <Link href={`/vans?bodyStyle=Tipper&q=${encodeURIComponent(m)}`} className="text-[var(--text-sm)] text-brand-700 hover:underline">
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
