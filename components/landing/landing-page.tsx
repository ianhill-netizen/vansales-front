import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Eyebrow, Button } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { ListingCard } from "@/components/listing-card";
import { getLandingBody } from "@/lib/content/landing-pages";
import { getListings } from "@/lib/listings/client";
import { listingPath } from "@/lib/listings/slug";
import { listingTitle } from "@/lib/listings/format";
import type { LandingDef } from "@/lib/landing-pages";
import { SITE, absUrl } from "@/lib/site";

/** The shared body of the four landing routes. H1, title, description and canonical are fixed in lib/landing-pages.ts; the body is the Gemini copy from the API. */
export function landingMetadata(d: LandingDef): Metadata {
  return {
    title: { absolute: d.title },
    description: d.description,
    alternates: { canonical: d.path },
    openGraph: { title: d.title, description: d.description, url: d.path, type: d.kind === "guide" ? "article" : "website" },
    twitter: { card: "summary_large_image", title: d.title, description: d.description },
  };
}

export async function LandingPage({ def }: { def: LandingDef }) {
  const res = await getLandingBody(def);
  if (res.status === "unavailable") throw new Error(`vansales-backend content API unavailable for ${def.backendSlug}`);
  if (res.status !== "ok") notFound();
  const buying = def.kind === "buying" && def.match;
  const matching = buying ? (await getListings({ status: "active" })).listings.filter((l) => def.match!(l)) : [];
  const shown = matching.slice(0, 12);
  const url = absUrl(def.path);
  const schema = buying
    ? { "@context": "https://schema.org", "@type": "ItemList", name: def.h1, description: def.description, url, numberOfItems: matching.length, itemListElement: shown.map((l, i) => ({ "@type": "ListItem", position: i + 1, url: absUrl(listingPath(l)), name: listingTitle(l) })) }
    : { "@context": "https://schema.org", "@type": "Article", headline: def.h1, description: def.description, mainEntityOfPage: url, url, author: { "@type": "Organization", name: SITE.name, url: absUrl("/") }, publisher: { "@type": "Organization", name: SITE.name, url: absUrl("/") }, ...(res.published ? { datePublished: res.published } : {}), ...(res.modified ? { dateModified: res.modified } : {}) };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
      ...(def.path.startsWith("/vans-for-sale/") ? [{ "@type": "ListItem", position: 2, name: "Vans for sale", item: absUrl("/vans") }] : []),
      { "@type": "ListItem", position: def.path.startsWith("/vans-for-sale/") ? 3 : 2, name: def.h1, item: url },
    ],
  };
  return (
    <>
      <JsonLd data={[schema, breadcrumb]} />
      <section className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[length:var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link><span aria-hidden>/</span>
            <span className="font-medium text-ink-700">{def.h1}</span>
          </nav>
          <Eyebrow>{def.eyebrow}</Eyebrow>
          <h1 className="mt-2 font-display text-[length:var(--text-3xl)] font-extrabold leading-tight text-ink-900">{def.h1}</h1>
          <p className="mt-3 max-w-2xl text-[length:var(--text-md)] text-ink-600">{def.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/van-finance" variant="primary" size="lg">Van finance</Button>
            <Button href="/vans" variant="outline" size="lg">Browse vans for sale</Button>
          </div>
        </Container>
      </section>
      <Container className="space-y-12 py-10">
        {buying && (
          <section>
            <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">{def.kind === "buying" && def.path === "/electric-vans" ? "Used electric vans for sale now" : "Used vans for sale now"}</h2>
            {shown.length === 0 ? (
              <p className="mt-3 max-w-2xl text-ink-600">There are none listed on Vansales right now. <Link href="/vans" className="font-semibold text-brand-700 hover:underline">Browse all vans for sale</Link>.</p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {shown.map((l, i) => <ListingCard key={l.id} listing={l} priority={i < 3} cardIndex={i} />)}
              </div>
            )}
          </section>
        )}
        {/* body_html is sanitised on the server (allow-listed tags, no attributes) before it reaches this page */}
        <article className="prose-vs max-w-3xl space-y-4 text-[length:var(--text-md)] leading-relaxed text-ink-600 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-[length:var(--text-xl)] [&_h2]:font-bold [&_h2]:text-ink-900 [&_h3]:mt-6 [&_h3]:font-display [&_h3]:font-bold [&_h3]:text-ink-900 [&_ul]:list-disc [&_ul]:pl-5" dangerouslySetInnerHTML={{ __html: res.bodyHtml }} />
        <section className="max-w-3xl rounded-[var(--radius-xl)] border border-border bg-surface-1 p-6">
          <h2 className="font-display text-[length:var(--text-lg)] font-bold text-ink-900">Spreading the cost?</h2>
          <p className="mt-2 text-[length:var(--text-sm)] text-ink-600">Read our guide to <Link href="/van-finance" className="font-semibold text-brand-700 hover:underline">van finance</Link>, then tell us your budget. We are not a lender: this page is information only.</p>
        </section>
        <section>
          <h2 className="font-display text-[length:var(--text-lg)] font-bold text-ink-900">Keep reading</h2>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
            {def.related.map((r) => <li key={r.href}><Link href={r.href} className="text-brand-700 hover:underline">{r.label}</Link></li>)}
            <li><Link href="/used-vans" className="text-brand-700 hover:underline">Used vans by make and model</Link></li>
          </ul>
        </section>
      </Container>
    </>
  );
}
