import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";
import { ListingCard } from "@/components/listing-card";
import { getListings } from "@/lib/listings/client";
import { SITE, absUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Crew Vans for Sale",
  description: "Browse crew vans and crew cab vans for sale. Dual-purpose vans with extra passenger seating plus a load area — ideal for teams that need transport and cargo capacity.",
  alternates: { canonical: absUrl("/vans/crew-van") },
  openGraph: {
    title: `Crew Vans for Sale · ${SITE.name}`,
    description: "Browse crew vans for sale across the UK.",
    url: absUrl("/vans/crew-van"),
    type: "website",
  },
};

export default async function CrewVanCategoryPage() {
  const result = await getListings({ bodyStyle: "Crew Cab", pageSize: 6 });

  return (
    <>
      <section className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link>
            <span>/</span>
            <Link href="/vans" className="hover:text-ink-900">Vans</Link>
            <span>/</span>
            <span className="font-medium text-ink-700">Crew vans</span>
          </nav>
          <Eyebrow>Body type</Eyebrow>
          <h1 className="mt-2 font-display text-[var(--text-3xl)] font-extrabold leading-tight text-ink-900">
            Crew vans for sale
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--text-md)] text-ink-600">
            Crew vans (also known as crew cabs or combi vans) seat up to 6–7 people with a separate load area behind. Perfect for contractors and tradesman who need to carry both staff and equipment in a single vehicle.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/vans?bodyStyle=Crew+Cab"
              className="rounded-[var(--radius-pill)] bg-ink-900 px-5 py-2 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700"
            >
              Browse {result.total > 0 ? `all ${result.total}` : ""} crew vans →
            </Link>
            <Link
              href="/vans?bodyStyle=Crew+Cab&condition=used"
              className="rounded-[var(--radius-pill)] border border-border bg-white px-5 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400"
            >
              Used crew vans
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-10">
        {result.listings.length > 0 && (
          <>
            <h2 className="mb-4 font-display text-[var(--text-xl)] font-bold text-ink-900">Latest crew vans</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {result.listings.map((l, i) => (
                <ListingCard key={l.id} listing={l} priority={i < 3} cardIndex={i} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/vans?bodyStyle=Crew+Cab"
                className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-ink-900 px-6 py-3 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700"
              >
                View all {result.total} crew vans
              </Link>
            </div>
          </>
        )}
      </Container>
    </>
  );
}
