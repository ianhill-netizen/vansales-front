import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Eyebrow } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { ListingCard } from "@/components/listing-card";
import { getLiveModelPageSlugs } from "@/lib/content/model-pages";
import { getMakeHub } from "@/lib/content/make-hubs";
import { getListings } from "@/lib/listings/client";
import { listingPath } from "@/lib/listings/slug";
import { listingTitle } from "@/lib/listings/format";
import { usedVanMakes, usedVanModelsOfMake, usedVanName, usedVanPath, vansPath } from "@/lib/used-vans/models";
import { SITE, absUrl } from "@/lib/site";

// A make is served when it is one of the allowlisted makes OR it has a published make_hub page (page_type make_hub in vansales-backend, slug = the make slug). Self-referencing canonical, ISR; anything else is a 404. The stock-driven /vans/{make} page is a different page (filters, facets): linked, not duplicated.
export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return usedVanMakes().map((m) => ({ make: m.makeSlug }));
}

type Params = { make: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const makeSlug = (await params).make;
  const models = usedVanModelsOfMake(makeSlug);
  const hubRes = await getMakeHub(makeSlug);
  const hub = hubRes.status === "ok" ? hubRes.hub : null;
  if (models.length === 0 && !hub) return {};
  const make = models[0]?.make ?? hub!.make;
  const title = hub?.metaTitle || `Used ${make} Vans For Sale: Buying Guides and Listings | ${SITE.name}`;
  const description = hub?.metaDescription || `Used ${make} vans for sale in the UK: buying guides for the ${models.map((m) => m.model).join(", ")} and the ${make} vans listed right now.`;
  const path = `/used-vans/${makeSlug}`;
  return { title: { absolute: title }, description, alternates: { canonical: path }, openGraph: { title, description, url: path, type: "website" }, twitter: { card: "summary_large_image", title, description } };
}

export default async function UsedVansMake({ params }: { params: Promise<Params> }) {
  const { make: makeSlug } = await params;
  const models = usedVanModelsOfMake(makeSlug);
  const hubRes = await getMakeHub(makeSlug);
  if (hubRes.status === "unavailable" && models.length === 0) throw new Error(`vansales-backend content API unavailable for make hub ${makeSlug}`);
  const hub = hubRes.status === "ok" ? hubRes.hub : null;
  if (models.length === 0 && !hub) notFound();
  const make = models[0]?.make ?? hub!.make;
  const [live, stock] = await Promise.all([getLiveModelPageSlugs(), getListings({ make: makeSlug, pageSize: 12 })]);
  const guides = models.filter((m) => live.has(m.pageSlug));
  const itemList = stock.listings.length > 0 && {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Used ${make} vans for sale`,
    numberOfItems: stock.total,
    itemListElement: stock.listings.map((l, i) => ({ "@type": "ListItem", position: i + 1, url: absUrl(listingPath(l)), name: listingTitle(l) })),
  };
  const article = hub && {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: hub.h1,
    mainEntityOfPage: absUrl(`/used-vans/${makeSlug}`),
    author: { "@type": "Organization", name: SITE.name, url: absUrl("/") },
    publisher: { "@type": "Organization", name: SITE.name, url: absUrl("/") },
    ...(hub.published ? { datePublished: hub.published } : {}),
    ...(hub.modified ? { dateModified: hub.modified } : {}),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
      { "@type": "ListItem", position: 2, name: "Used vans", item: absUrl("/used-vans") },
      { "@type": "ListItem", position: 3, name: `Used ${make} vans`, item: absUrl(`/used-vans/${makeSlug}`) },
    ],
  };
  return (
    <>
      <JsonLd data={[...(itemList ? [itemList] : []), ...(article ? [article] : []), breadcrumb]} />
      <section className="border-b border-border bg-surface-1">
        <Container className="py-8">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[length:var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link><span aria-hidden>/</span>
            <Link href="/used-vans" className="hover:text-ink-900">Used vans</Link><span aria-hidden>/</span>
            <span className="font-medium text-ink-700">{make}</span>
          </nav>
          <Eyebrow>{make}</Eyebrow>
          <h1 className="mt-2 font-display text-[length:var(--text-3xl)] font-extrabold leading-tight text-ink-900">{hub?.h1 ?? `Used ${make} Vans For Sale`}</h1>
          <p className="mt-3 max-w-2xl text-[length:var(--text-md)] leading-relaxed text-ink-600">
            Pick a model for the buying guide and the {make} vans listed now, or filter all {make} stock on the{" "}
            <Link href={`/vans/${makeSlug}`} className="font-semibold text-brand-700 hover:underline">{make} vans search</Link>.
          </p>
        </Container>
      </section>
      <Container className="space-y-10 py-8">
        {models.length > 0 && <section>
          <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">Used {make} models</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {models.map((m) => (
              <li key={m.pageSlug}>
                {live.has(m.pageSlug) ? (
                  <Link href={usedVanPath(m)} className="text-[length:var(--text-md)] text-brand-700 hover:underline">Used {usedVanName(m)} for sale</Link>
                ) : (
                  <span className="text-ink-500">Used {m.make} {m.model}: guide coming soon</span>
                )}{" "}
                <Link href={vansPath(m)} className="text-[length:var(--text-sm)] text-ink-400 hover:underline">(search stock)</Link>
              </li>
            ))}
          </ul>
          {guides.length === 0 && <p className="mt-3 text-[length:var(--text-sm)] text-ink-500">The {make} guides are being prepared.</p>}
        </section>}
        <section>
          <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">{make} vans for sale now</h2>
          {stock.listings.length === 0 ? (
            <p className="mt-3 text-ink-600">There is no {make} on Vansales right now. <Link href={`/vans/${makeSlug}`} className="font-semibold text-brand-700 hover:underline">See similar vans</Link> or check back soon.</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {stock.listings.map((l, i) => <ListingCard key={l.id} listing={l} priority={i < 3} cardIndex={i} />)}
            </div>
          )}
        </section>
        {hub && (
          /* body_html is sanitised on the server (allow-listed tags, no attributes) before it reaches this page */
          <article className="prose-vs max-w-3xl space-y-4 text-[length:var(--text-md)] leading-relaxed text-ink-600 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-[length:var(--text-xl)] [&_h2]:font-bold [&_h2]:text-ink-900 [&_h3]:mt-6 [&_h3]:font-display [&_h3]:font-bold [&_h3]:text-ink-900 [&_ul]:list-disc [&_ul]:pl-5" dangerouslySetInnerHTML={{ __html: hub.bodyHtml }} />
        )}
      </Container>
    </>
  );
}
