import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";
import { DealerGrid } from "@/components/dealer-grid";
import { JsonLd } from "@/components/json-ld";
import { getDealerDirectory } from "@/lib/dealers/directory";
import { SITE, absUrl } from "@/lib/site";

export const revalidate = 3600;

const TITLE = "Van dealers";
const DESCRIPTION = `Find van dealers across the UK on ${SITE.name}. Search by name or location, filter by the makes they stock and browse their vans for sale.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absUrl("/dealers") },
  openGraph: { title: `${TITLE} · ${SITE.name}`, description: DESCRIPTION, url: absUrl("/dealers"), type: "website" },
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

  return (
    <>
      <JsonLd data={[ld]} />
      <section className="border-b border-border bg-white">
        <Container className="py-8">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-700">Home</Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-ink-600">Dealers</span>
          </nav>
          <Eyebrow>Directory</Eyebrow>
          <h1 className="mt-2 font-display text-[var(--text-3xl)] font-extrabold leading-tight text-ink-900">Van dealers</h1>
          <p className="mt-2 max-w-2xl text-[var(--text-md)] text-ink-500">
            Dealers listing vans on {SITE.name}. Open a dealer to see their stock, opening hours and how to get in touch.
          </p>
        </Container>
      </section>
      <Container className="py-8">
        <DealerGrid dealers={dealers} />
        <p className="mt-10 text-[var(--text-sm)] text-ink-500">
          Are you a dealer? <Link href="/advertise" className="font-semibold text-brand-600 hover:underline">See our advertising packages</Link>.
        </p>
      </Container>
    </>
  );
}
