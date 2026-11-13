import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";
import { DealerGrid } from "@/components/dealer-grid";
import { JsonLd } from "@/components/json-ld";
import { getDealerDirectory } from "@/lib/dealers/directory";
import { regionPageFor, townLabel, townSlug } from "@/lib/dealers/places";
import { SITE, absUrl, DEFAULT_OG_IMAGES } from "@/lib/site";

export const revalidate = 300; // 5 min: counts come from the vansales API (60 s data cache), so an hour showed stale "0 vans"

const TITLE = "Van dealers";
const DESCRIPTION = `Find van dealers across the UK on ${SITE.name}. Search by name or location, filter by the makes they stock and browse their vans for sale.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absUrl("/dealers") },
  openGraph: { images: DEFAULT_OG_IMAGES, title: `${TITLE} · ${SITE.name}`, description: DESCRIPTION, url: absUrl("/dealers"), type: "website" },
};

export default async function DealersPage() {
  const dealers = await getDealerDirectory();
  const ld = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Van dealers on Vansales",
    itemListElement: dealers.map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absUrl(`/dealer/${d.slug}`),
      name: d.name,
    })),
  };

  // The same dealers grouped by area (the regional "vans for sale" page that covers them, else their county), each with its town page: a crawlable index of every dealer and town.
  const groups = new Map<string, { label: string; dealers: typeof dealers }>();
  for (const d of dealers) {
    const region = regionPageFor({ town: d.town, county: d.county });
    const label = region ? region.name : d.county || "Other areas";
    const g = groups.get(label) ?? { label, dealers: [] };
    g.dealers.push(d);
    groups.set(label, g);
  }
  const byArea = [...groups.values()].sort((a, b) => a.label.localeCompare(b.label));

  return (
    <>
      <JsonLd data={[ld]} />
      <section className="border-b border-border bg-white">
        <Container className="py-8">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[length:var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-700">Home</Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-ink-600">Dealers</span>
          </nav>
          <Eyebrow>Directory</Eyebrow>
          <h1 className="mt-2 font-display text-[length:var(--text-3xl)] font-extrabold leading-tight text-ink-900">Van dealers</h1>
          <p className="mt-2 max-w-2xl text-[length:var(--text-md)] text-ink-500">
            Dealers listing vans on {SITE.name}. Open a dealer to see their stock, opening hours and how to get in touch.
          </p>
        </Container>
      </section>
      <Container className="py-8">
        <DealerGrid dealers={dealers} />
        {byArea.length > 0 && (
          <section aria-labelledby="by-area" className="mt-12">
            <h2 id="by-area" className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">Van dealers by area</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {byArea.map((g) => (
                <div key={g.label}>
                  <h3 className="font-display font-bold text-ink-900">{g.label}</h3>
                  <ul className="mt-2 space-y-1 text-[length:var(--text-sm)]">
                    {g.dealers.map((d) => (
                      <li key={d.slug}>
                        <Link href={`/dealer/${d.slug}`} className="text-brand-700 hover:underline">{d.name}</Link>
                        {d.town && <> · <Link href={`/dealers/${townSlug(d.town)}`} className="text-ink-500 hover:underline">{townLabel(d.town)}</Link></>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
        <p className="mt-10 text-[length:var(--text-sm)] text-ink-500">
          Are you a dealer? <Link href="/advertise" className="font-semibold text-brand-600 hover:underline">See our advertising packages</Link>.
        </p>
      </Container>
    </>
  );
}
