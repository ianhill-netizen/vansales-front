import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";
import { ListingCard } from "@/components/listing-card";
import { getListings } from "@/lib/listings/client";
import { SITE, absUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pickup Trucks for Sale",
  description: "Browse pickup trucks for sale across the UK. Single and double-cab pickups, new and used. Ford Ranger, Toyota Hilux, Mitsubishi L200 and more.",
  alternates: { canonical: absUrl("/vans/pickup") },
  openGraph: {
    title: `Pickup Trucks for Sale · ${SITE.name}`,
    description: "Browse pickup trucks for sale across the UK.",
    url: absUrl("/vans/pickup"),
    type: "website",
  },
};

export default async function PickupCategoryPage() {
  const result = await getListings({ bodyStyle: "Pickup", pageSize: 6 });

  return (
    <>
      <section className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link>
            <span>/</span>
            <Link href="/vans" className="hover:text-ink-900">Vans</Link>
            <span>/</span>
            <span className="font-medium text-ink-700">Pickup trucks</span>
          </nav>
          <Eyebrow>Body type</Eyebrow>
          <h1 className="mt-2 font-display text-[var(--text-3xl)] font-extrabold leading-tight text-ink-900">
            Pickup trucks for sale
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--text-md)] text-ink-600">
            Pickup trucks combine off-road capability with serious towing and payload ratings. Available as single or double cab, they&apos;re equally at home on a farm, construction site or towing a horsebox. Many qualify for van-rate road tax.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/vans?bodyStyle=Pickup"
              className="rounded-[var(--radius-pill)] bg-ink-900 px-5 py-2 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700"
            >
              Browse {result.total > 0 ? `all ${result.total}` : ""} pickups →
            </Link>
            <Link
              href="/vans?bodyStyle=Pickup&condition=new"
              className="rounded-[var(--radius-pill)] border border-border bg-white px-5 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400"
            >
              New pickups
            </Link>
            <Link
              href="/vans?bodyStyle=Pickup&condition=used"
              className="rounded-[var(--radius-pill)] border border-border bg-white px-5 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400"
            >
              Used pickups
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-10">
        {result.listings.length > 0 && (
          <>
            <h2 className="mb-4 font-display text-[var(--text-xl)] font-bold text-ink-900">Latest pickups</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {result.listings.map((l, i) => (
                <ListingCard key={l.id} listing={l} priority={i < 3} cardIndex={i} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/vans?bodyStyle=Pickup"
                className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-ink-900 px-6 py-3 text-[var(--text-sm)] font-semibold text-white hover:bg-ink-700"
              >
                View all {result.total} pickups
              </Link>
            </div>
          </>
        )}

        <div className="mt-12 rounded-[var(--radius-xl)] border border-border bg-card p-6">
          <h3 className="font-display text-[var(--text-lg)] font-bold text-ink-900">Popular pickup makes</h3>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {["Ford Ranger", "Toyota Hilux", "Mitsubishi L200", "Isuzu D-Max", "Nissan Navara", "Volkswagen Amarok"].map((m) => (
              <li key={m}>
                <Link href={`/vans?bodyStyle=Pickup&q=${encodeURIComponent(m)}`} className="text-[var(--text-sm)] text-brand-700 hover:underline">
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
