import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Eyebrow } from "@/components/ui";
import { DealerLogo } from "@/components/dealer-logo";
import { JsonLd } from "@/components/json-ld";
import { getDealerDirectory } from "@/lib/dealers/directory";
import { regionPageFor, townLabel, townSlug } from "@/lib/dealers/places";
import { DEFAULT_OG_IMAGES, absUrl } from "@/lib/site";

// /dealers/{town}: "Van Dealers in {Town}", listing the dealers in that town. A town with no dealer is a 404 (never a thin page); an unreachable API errors the render instead of caching a 404.
// Self-referencing canonical. ISR 5 minutes.
export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

type Params = { town: string };

async function load(params: Promise<Params>) {
  const { town } = await params;
  if (!/^[a-z0-9][a-z0-9-]{0,80}$/.test(town)) return null;
  const all = await getDealerDirectory();
  const dealers = all.filter((d) => d.town && townSlug(d.town) === town);
  if (dealers.length === 0) return null;
  return { slug: town, label: townLabel(dealers[0].town), dealers };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const found = await load(params);
  if (!found) return {};
  const title = `Van Dealers in ${found.label} | Vansales`;
  const description = `${found.dealers.length} van dealer${found.dealers.length === 1 ? "" : "s"} in ${found.label} on Vansales. See their stock, opening hours and how to get in touch.`;
  const url = `/dealers/${found.slug}`;
  return { title: { absolute: title }, description, alternates: { canonical: url }, openGraph: { images: DEFAULT_OG_IMAGES, title, description, url, type: "website" } };
}

export default async function DealersInTown({ params }: { params: Promise<Params> }) {
  const found = await load(params);
  if (!found) notFound();
  const region = regionPageFor({ town: found.label, county: found.dealers[0].county });
  const ld = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Van dealers in ${found.label}`,
    numberOfItems: found.dealers.length,
    itemListElement: found.dealers.map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "AutoDealer",
        name: d.name,
        url: absUrl(`/dealer/${d.slug}`),
        address: { "@type": "PostalAddress", addressLocality: found.label, ...(d.county ? { addressRegion: d.county } : {}), addressCountry: "GB" },
        ...(d.lat != null && d.lng != null ? { geo: { "@type": "GeoCoordinates", latitude: d.lat, longitude: d.lng } } : {}),
      },
    })),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
      { "@type": "ListItem", position: 2, name: "Van dealers", item: absUrl("/dealers") },
      { "@type": "ListItem", position: 3, name: found.label, item: absUrl(`/dealers/${found.slug}`) },
    ],
  };
  return (
    <>
      <JsonLd data={[ld, breadcrumb]} />
      <section className="border-b border-border bg-white">
        <Container className="py-8">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[length:var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-700">Home</Link><span aria-hidden>/</span>
            <Link href="/dealers" className="hover:text-ink-700">Van dealers</Link><span aria-hidden>/</span>
            <span className="font-medium text-ink-600">{found.label}</span>
          </nav>
          <Eyebrow>Directory</Eyebrow>
          <h1 className="mt-2 font-display text-[length:var(--text-3xl)] font-extrabold leading-tight text-ink-900">Van Dealers in {found.label}</h1>
          <p className="mt-2 max-w-2xl text-[length:var(--text-md)] text-ink-500">
            {found.dealers.length} van dealer{found.dealers.length === 1 ? "" : "s"} in {found.label}. Open a dealer to see their stock, opening hours and how to get in touch.
            {region && <> Looking further afield? See <Link href={region.path} className="font-semibold text-brand-700 hover:underline">used vans for sale in {region.name}</Link>.</>}
          </p>
        </Container>
      </section>
      <Container className="py-8">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {found.dealers.map((d) => (
            <li key={d.slug}>
              <Link href={`/dealer/${d.slug}`} className="group flex items-center gap-3.5 rounded-[var(--radius-xl)] border border-border bg-white p-5 shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
                <DealerLogo name={d.name} logoUrl={d.logoUrl} size={72} />
                <span className="min-w-0">
                  <span className="block truncate font-display text-[length:var(--text-lg)] font-bold text-ink-900 group-hover:text-brand-700">{d.name}</span>
                  <span className="block truncate text-[length:var(--text-sm)] text-ink-500">{[found.label, d.county && d.county.toLowerCase() !== found.label.toLowerCase() ? d.county : ""].filter(Boolean).join(", ")}</span>
                  <span className="mt-1 block text-[length:var(--text-xs)] font-semibold text-brand-700">{d.vanCount > 0 ? `${d.vanCount} van${d.vanCount === 1 ? "" : "s"} in stock` : "View dealer"}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-[length:var(--text-sm)] text-ink-500">
          <Link href="/dealers" className="font-semibold text-brand-600 hover:underline">All van dealers →</Link>
        </p>
      </Container>
    </>
  );
}
