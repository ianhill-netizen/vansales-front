import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Eyebrow } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { ListingCard } from "@/components/listing-card";
import { Photo } from "@/components/photo";
import { getAccessoryBody } from "@/lib/content/accessories";
import { getListings } from "@/lib/listings/client";
import { listingTitle } from "@/lib/listings/format";
import type { Listing } from "@/lib/listings/types";
import { ACCESSORIES, ACCESSORY_HUB, type AccessoryDef } from "@/lib/accessories";
import { SITE, absUrl } from "@/lib/site";

type Page = { backendSlug: string; path: string; h1: string; title: string; description: string; stock?: AccessoryDef["stock"] };

export function accessoryMetadata(p: Page): Metadata {
  return {
    title: { absolute: p.title },
    description: p.description,
    alternates: { canonical: p.path },
    openGraph: { title: p.title, description: p.description, url: p.path, type: "article" },
    twitter: { card: "summary_large_image", title: p.title, description: p.description },
  };
}

const haystack = (l: Listing) => [listingTitle(l), l.description ?? "", ...(l.features ?? []), ...(l.extras ?? []).flatMap((e) => [e.slug, e.label])].join(" ");

type Extras = {
  /** A page under another topic page (the six alloy-wheel model pages): shown in the breadcrumb between the hub and the page. */
  parent?: { path: string; h1: string };
  /** Genuine Swiss Vans photos for the page (never generated). Empty = no photo section. */
  photos?: readonly { url: string; alt: string }[];
  /** Links to child pages (shown on the parent topic page). */
  childLinks?: { title: string; links: { href: string; label: string }[] };
};

export async function AccessoryPage({ page, isHub, parent, photos, childLinks }: { page: Page; isHub?: boolean } & Extras) {
  const res = await getAccessoryBody(page.backendSlug);
  if (res.status === "unavailable") throw new Error(`vansales-backend content API unavailable for ${page.backendSlug}`);
  if (res.status !== "ok") notFound();
  const stock = page.stock ? (await getListings({ status: "active" })).listings.filter((l) => page.stock!.match.test(haystack(l))) : [];
  const url = absUrl(page.path);
  const article = { "@context": "https://schema.org", "@type": "Article", headline: page.h1, description: page.description, mainEntityOfPage: url, url, author: { "@type": "Organization", name: SITE.name, url: absUrl("/") }, publisher: { "@type": "Organization", name: SITE.name, url: absUrl("/") }, ...(res.published ? { datePublished: res.published } : {}), ...(res.modified ? { dateModified: res.modified } : {}) };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
      { "@type": "ListItem", position: 2, name: ACCESSORY_HUB.h1, item: absUrl(ACCESSORY_HUB.path) },
      ...(parent ? [{ "@type": "ListItem", position: 3, name: parent.h1, item: absUrl(parent.path) }] : []),
      ...(isHub ? [] : [{ "@type": "ListItem", position: parent ? 4 : 3, name: page.h1, item: url }]),
    ],
  };
  const faq = res.faq.length >= 3 ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: res.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) } : null;
  return (
    <>
      <JsonLd data={[article, breadcrumb, ...(faq ? [faq] : [])]} />
      <section className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[length:var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link><span aria-hidden>/</span>
            {isHub ? <span className="font-medium text-ink-700">{ACCESSORY_HUB.h1}</span> : <><Link href={ACCESSORY_HUB.path} className="hover:text-ink-900">{ACCESSORY_HUB.h1}</Link><span aria-hidden>/</span>{parent && <><Link href={parent.path} className="hover:text-ink-900">{parent.h1}</Link><span aria-hidden>/</span></>}<span className="font-medium text-ink-700">{page.h1}</span></>}
          </nav>
          <Eyebrow>Van accessories</Eyebrow>
          <h1 className="mt-2 font-display text-[length:var(--text-3xl)] font-extrabold leading-tight text-ink-900">{page.h1}</h1>
          <p className="mt-3 max-w-2xl text-[length:var(--text-md)] text-ink-600">{page.description}</p>
        </Container>
      </section>
      <Container className="space-y-12 py-10">
        {/* body_html is sanitised on the server (allow-listed tags, no attributes) before it reaches this page */}
        <article className="prose-vs max-w-3xl space-y-4 text-[length:var(--text-md)] leading-relaxed text-ink-600 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-[length:var(--text-xl)] [&_h2]:font-bold [&_h2]:text-ink-900 [&_h3]:mt-6 [&_h3]:font-display [&_h3]:font-bold [&_h3]:text-ink-900 [&_ul]:list-disc [&_ul]:pl-5" dangerouslySetInnerHTML={{ __html: res.bodyHtml }} />
        {photos && photos.length > 0 && (
          <section>
            <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">Wheels we have fitted</h2>
            <p className="mt-2 text-[length:var(--text-sm)] text-ink-500">Photographs from the Swiss Vans photo library.</p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {photos.map((p) => (
                <div key={p.url} className="relative aspect-[3/2] overflow-hidden rounded-[var(--radius-lg)] bg-surface-2 ring-1 ring-border">
                  <Photo src={p.url} alt={p.alt} sizes="(min-width: 640px) 45vw, 100vw" />
                </div>
              ))}
            </div>
          </section>
        )}
        {childLinks && childLinks.links.length > 0 && (
          <section>
            <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">{childLinks.title}</h2>
            <ul className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
              {childLinks.links.map((l) => <li key={l.href}><Link href={l.href} className="font-semibold text-brand-700 hover:underline">{l.label}</Link></li>)}
            </ul>
          </section>
        )}
        {isHub && (
          <section>
            <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">Van accessory guides</h2>
            <ul className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
              {ACCESSORIES.map((a) => <li key={a.slug}><Link href={a.path} className="font-semibold text-brand-700 hover:underline">{a.h1}</Link></li>)}
            </ul>
          </section>
        )}
        {page.stock && (
          <section>
            <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">Vans in stock with this</h2>
            {stock.length === 0 ? (
              <p className="mt-3 max-w-2xl text-ink-600">None of the vans listed right now mention {page.stock.label}. <Link href="/vans" className="font-semibold text-brand-700 hover:underline">Browse all vans for sale</Link>.</p>
            ) : (
              <>
                <p className="mt-2 text-ink-600">{stock.length} {stock.length === 1 ? "van mentions" : "vans mention"} {page.stock.label} in the dealer or seller details.</p>
                <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {stock.slice(0, 6).map((l, i) => <ListingCard key={l.id} listing={l} priority={i < 3} cardIndex={i} />)}
                </div>
              </>
            )}
          </section>
        )}
        {!isHub && (
          <section>
            <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">More van accessory guides</h2>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
              {ACCESSORIES.filter((a) => a.path !== page.path).map((a) => <li key={a.slug}><Link href={a.path} className="text-brand-700 hover:underline">{a.h1}</Link></li>)}
              <li><Link href={ACCESSORY_HUB.path} className="font-semibold text-brand-700 hover:underline">All van accessories</Link></li>
            </ul>
          </section>
        )}
      </Container>
    </>
  );
}
