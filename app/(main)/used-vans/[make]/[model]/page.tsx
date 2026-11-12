import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Eyebrow } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { ListingCard } from "@/components/listing-card";
import { ModelEnquiryForm } from "@/components/used-vans/model-enquiry-form";
import { getModelPage } from "@/lib/content/model-pages";
import { ContentLinks } from "@/components/content-links";
import { getModelContentLinks } from "@/lib/content/make-related";
import { getListings } from "@/lib/listings/client";
import { listingPath } from "@/lib/listings/slug";
import { listingTitle } from "@/lib/listings/format";
import { findUsedVanModelByParam, usedVanDescription, usedVanH1, usedVanModelsOfMake, usedVanName, usedVanPath, usedVanTitle, vansPath } from "@/lib/used-vans/models";
import { SITE, absUrl } from "@/lib/site";

// /used-vans/{make}/{model}: the editorial buying guide (vansales-backend content_pages, page_type make_model) with the live listings for that model and an enquiry form.
// Only the 20 allowlisted models route here; one with no published editorial page is a 404. Self-referencing canonical. The stock-driven /vans/{make}/{model} page is a DIFFERENT page (filters, pagination,
// facets): it is linked from here, and this page does not repeat its filters. ISR 5 minutes, and an unreachable API errors the render instead of caching a 404.
export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

type Params = { make: string; model: string };

async function load(params: Promise<Params>) {
  const { make, model } = await params;
  const m = findUsedVanModelByParam(make, model);   // only /{model}-for-sale is a page; the old URL is a 301 in next.config.ts
  if (!m) return null;
  const res = await getModelPage(m.pageSlug);
  if (res.status === "unavailable") throw new Error(`vansales-backend content API unavailable for ${m.pageSlug}`);
  if (res.status !== "ok") return null;
  return { m, page: res.page };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const found = await load(params);
  if (!found) return {};
  const { m, page } = found;
  const path = usedVanPath(m);
  const title = usedVanTitle(m);   // "Used VW Caddy For Sale | Vansales.com": the pattern, not whatever the content agent wrote
  const description = usedVanDescription(m);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "website", ...(page.heroUrl ? { images: [{ url: page.heroUrl, alt: page.heroAlt || `Used ${usedVanName(m)}` }] } : {}) },
    twitter: { card: "summary_large_image", title, description, ...(page.heroUrl ? { images: [page.heroUrl] } : {}) },
  };
}

export default async function UsedVansModel({ params }: { params: Promise<Params> }) {
  const found = await load(params);
  if (!found) notFound();
  const { m, page } = found;
  const stock = await getListings({ make: m.makeSlug, model: m.modelSlug, pageSize: 12 });
  const vehicle = `used ${m.make} ${m.model}`;
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: usedVanH1(m),
    description: usedVanDescription(m),
    url: absUrl(usedVanPath(m)),
    numberOfItems: stock.total,
    itemListElement: stock.listings.map((l, i) => ({ "@type": "ListItem", position: i + 1, url: absUrl(listingPath(l)), name: listingTitle(l) })),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
      { "@type": "ListItem", position: 2, name: "Used vans", item: absUrl("/used-vans") },
      { "@type": "ListItem", position: 3, name: `Used ${m.make} vans`, item: absUrl(`/used-vans/${m.makeSlug}`) },
      { "@type": "ListItem", position: 4, name: usedVanH1(m), item: absUrl(usedVanPath(m)) },
    ],
  };
  const siblings = usedVanModelsOfMake(m.makeSlug).filter((x) => x.pageSlug !== m.pageSlug);
  const related = await getModelContentLinks(m);
  return (
    <>
      <JsonLd data={[itemList, breadcrumb]} />
      <section className="border-b border-border bg-surface-1">
        <Container className="py-8">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[length:var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link><span aria-hidden>/</span>
            <Link href="/used-vans" className="hover:text-ink-900">Used vans</Link><span aria-hidden>/</span>
            <Link href={`/used-vans/${m.makeSlug}`} className="hover:text-ink-900">{m.make}</Link><span aria-hidden>/</span>
            <span className="font-medium text-ink-700">{m.model}</span>
          </nav>
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_minmax(0,440px)]">
            <div>
              <Eyebrow>{m.make}</Eyebrow>
              <h1 className="mt-2 font-display text-[length:var(--text-3xl)] font-extrabold leading-tight text-ink-900">{usedVanH1(m)}</h1>
              <p className="mt-4 text-[length:var(--text-sm)] font-semibold text-ink-600">
                <span className="font-mono text-brand-700">{stock.total}</span> {stock.total === 1 ? "van" : "vans"} listed now ·{" "}
                <Link href={vansPath(m)} className="text-brand-700 hover:underline">search and filter all {m.make} {m.model} stock</Link>
              </p>
              <p className="mt-4"><a href="#enquire" className="font-semibold text-brand-700 hover:underline">Looking for one? Tell us what you want</a></p>
            </div>
            {page.heroUrl && (
              <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] bg-surface-2 ring-1 ring-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={page.heroUrl} alt={page.heroAlt || `Used ${usedVanName(m)}`} className="size-full object-cover" fetchPriority="high" />
              </div>
            )}
          </div>
        </Container>
      </section>
      <Container className="space-y-12 py-8">
        <section>
          <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">Used {m.make} {m.model} for sale now</h2>
          {stock.listings.length === 0 ? (
            <p className="mt-3 max-w-2xl text-ink-600">
              There is no {m.make} {m.model} on Vansales right now. Tell us what you are after below and we will let you know when one is listed, or{" "}
              <Link href={vansPath(m)} className="font-semibold text-brand-700 hover:underline">see similar vans</Link>.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {stock.listings.map((l, i) => <ListingCard key={l.id} listing={l} priority={i < 3} cardIndex={i} />)}
            </div>
          )}
        </section>
        <article className="max-w-3xl">
          <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">Buying a used {m.make} {m.model}</h2>
          {/* body_html is sanitised on the server (allow-listed tags, no attributes, https images only) before it reaches this page */}
          <div className="prose-vs mt-3 space-y-4 text-[length:var(--text-md)] leading-relaxed text-ink-600 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-[length:var(--text-xl)] [&_h2]:font-bold [&_h2]:text-ink-900 [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-ink-900 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5" dangerouslySetInnerHTML={{ __html: page.bodyHtml }} />
        </article>
        <section id="enquire" className="max-w-xl scroll-mt-24">
          <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">Looking for a {vehicle}?</h2>
          <p className="mt-2 text-[length:var(--text-sm)] text-ink-600">Leave your details and what you need, and we will come back to you.</p>
          <div className="mt-4"><ModelEnquiryForm vehicle={vehicle} path={usedVanPath(m)} /></div>
        </section>
        {siblings.length > 0 && (
          <section>
            <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">More used {m.make} vans</h2>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
              {siblings.map((x) => <li key={x.pageSlug}><Link href={usedVanPath(x)} className="text-brand-700 hover:underline">Used {x.make} {x.model}</Link></li>)}
              <li><Link href={`/used-vans/${m.makeSlug}`} className="text-brand-700 hover:underline">All used {m.make} vans</Link></li>
            </ul>
          </section>
        )}
        <ContentLinks title={`${m.make} ${m.model} guides`} links={related.guides} />
        <ContentLinks title={`Latest ${m.make} ${m.model} news`} links={related.news} />
      </Container>
    </>
  );
}
