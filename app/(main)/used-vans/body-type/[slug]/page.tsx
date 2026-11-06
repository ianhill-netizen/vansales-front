import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Eyebrow } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { ListingCard } from "@/components/listing-card";
import { ModelEnquiryForm } from "@/components/used-vans/model-enquiry-form";
import { getBodyTypePage, getLiveBodyTypeSlugs } from "@/lib/content/body-type-pages";
import { getLiveModelPageSlugs } from "@/lib/content/model-pages";
import { getListings } from "@/lib/listings/client";
import { listingPath } from "@/lib/listings/slug";
import { listingTitle } from "@/lib/listings/format";
import { BODY_TYPE_PAGES, bodyTypeDescription, bodyTypeH1, bodyTypePath, bodyTypeTitle, findBodyType, findBodyTypeByParam } from "@/lib/used-vans/body-types";
import { findUsedVanModel, usedVanPath } from "@/lib/used-vans/models";
import { SITE, absUrl } from "@/lib/site";

// /used-vans/body-type/{slug}: one of ten body/equipment types (luton, dropside, tipper, curtain side, refrigerated, crew van, high roof, long wheelbase, 4x4, wheelchair accessible).
// The copy (H1, meta, 600-word buying guide, two pictures) is vansales-backend's body_type_pages; the listings are the live stock that matches the type (lib/used-vans/body-types.ts).
// A slug that is not one of the ten, or is not published, is a 404; an unreachable API errors the render instead of caching a 404. Self-referencing canonical. ISR 5 minutes.
export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

type Params = { slug: string };

async function load(params: Promise<Params>) {
  const { slug } = await params;
  const def = findBodyTypeByParam(slug);   // only /{slug}-for-sale is a page; the old URL is a 301 in next.config.ts
  const api = def ? def.slug : slug;
  if (!def) return null;
  const res = await getBodyTypePage(api);
  if (res.status === "unavailable") throw new Error(`vansales-backend body-type API unavailable for ${slug}`);
  if (res.status !== "ok") return null;
  return { def, page: res.page };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const found = await load(params);
  if (!found) return {};
  const { def, page } = found;
  const path = bodyTypePath(def);
  const title = bodyTypeTitle(def);
  const description = bodyTypeDescription(def);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "website", ...(page.heroUrl ? { images: [{ url: page.heroUrl, alt: page.heroAlt || `Used ${def.label}` }] } : {}) },
    twitter: { card: "summary_large_image", title, description, ...(page.heroUrl ? { images: [page.heroUrl] } : {}) },
  };
}

export default async function UsedVansBodyType({ params }: { params: Promise<Params> }) {
  const found = await load(params);
  if (!found) notFound();
  const { def, page } = found;
  const [all, liveModels, liveTypes] = await Promise.all([getListings({ status: "active" }), getLiveModelPageSlugs(), getLiveBodyTypeSlugs()]);
  const matching = all.listings.filter((l) => def.match(l));
  const shown = matching.slice(0, 12);
  const path = bodyTypePath(def);
  const h1 = bodyTypeH1(def);
  const models = def.models.flatMap(([make, model]) => {
    const m = findUsedVanModel(make, model);
    return m && liveModels.has(m.pageSlug) ? [m] : [];
  });
  const otherTypes = BODY_TYPE_PAGES.filter((b) => b.slug !== def.slug && liveTypes.has(b.slug));
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: h1,
    description: bodyTypeDescription(def),
    url: absUrl(path),
    numberOfItems: matching.length,
    itemListElement: shown.map((l, i) => ({ "@type": "ListItem", position: i + 1, url: absUrl(listingPath(l)), name: listingTitle(l) })),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
      { "@type": "ListItem", position: 2, name: "Used vans", item: absUrl("/used-vans") },
      { "@type": "ListItem", position: 3, name: `Used ${def.label}`, item: absUrl(path) },
    ],
  };
  return (
    <>
      <JsonLd data={[itemList, breadcrumb]} />
      <section className="border-b border-border bg-surface-1">
        <Container className="py-8">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[length:var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link><span aria-hidden>/</span>
            <Link href="/used-vans" className="hover:text-ink-900">Used vans</Link><span aria-hidden>/</span>
            <span className="font-medium text-ink-700">{def.label[0].toUpperCase() + def.label.slice(1)}</span>
          </nav>
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_minmax(0,440px)]">
            <div>
              <Eyebrow>Body type</Eyebrow>
              <h1 className="mt-2 font-display text-[length:var(--text-3xl)] font-extrabold leading-tight text-ink-900">{h1}</h1>
              <p className="mt-4 text-[length:var(--text-sm)] font-semibold text-ink-600">
                <span className="font-mono text-brand-700">{matching.length}</span> {matching.length === 1 ? "van" : "vans"} listed now
                {def.vansCategory && (
                  <> · <Link href={`/vans/${def.vansCategory}`} className="text-brand-700 hover:underline">search and filter all {def.label}</Link></>
                )}
              </p>
              <p className="mt-4"><a href="#enquire" className="font-semibold text-brand-700 hover:underline">Looking for one? Tell us what you want</a></p>
            </div>
            {page.heroUrl && (
              <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] bg-surface-2 ring-1 ring-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={page.heroUrl} alt={page.heroAlt || `Used ${def.label}`} className="size-full object-cover" fetchPriority="high" />
              </div>
            )}
          </div>
        </Container>
      </section>
      <Container className="space-y-12 py-8">
        <section>
          <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">Used {def.label} for sale now</h2>
          {shown.length === 0 ? (
            <p className="mt-3 max-w-2xl text-ink-600">
              There are no {def.label} on Vansales right now. Tell us what you are after below and we will let you know when one is listed, or{" "}
              <Link href="/vans" className="font-semibold text-brand-700 hover:underline">browse all vans for sale</Link>.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((l, i) => <ListingCard key={l.id} listing={l} priority={i < 3} cardIndex={i} />)}
            </div>
          )}
        </section>
        <article className="max-w-3xl">
          <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">Buying used {def.label}</h2>
          {/* blurb_html is sanitised (allow-listed tags, no attributes) before it reaches this page */}
          <div className="prose-vs mt-3 space-y-4 text-[length:var(--text-md)] leading-relaxed text-ink-600" dangerouslySetInnerHTML={{ __html: page.blurbHtml }} />
          {page.contextUrl && (
            <figure className="my-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={page.contextUrl} alt={page.contextAlt || `Used ${def.label} at work`} loading="lazy" decoding="async" className="w-full rounded-lg" />
            </figure>
          )}
        </article>
        {models.length > 0 && (
          <section>
            <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">Popular models</h2>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
              {models.map((m) => <li key={m.pageSlug}><Link href={usedVanPath(m)} className="text-brand-700 hover:underline">Used {m.make} {m.model}</Link></li>)}
            </ul>
          </section>
        )}
        <section id="enquire" className="max-w-xl scroll-mt-24">
          <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">Looking for a {def.singular}?</h2>
          <p className="mt-2 text-[length:var(--text-sm)] text-ink-600">Leave your details and what you need, and we will come back to you.</p>
          <div className="mt-4"><ModelEnquiryForm vehicle={`used ${def.singular}`} path={path} /></div>
        </section>
        {otherTypes.length > 0 && (
          <section>
            <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">More used vans by body type</h2>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
              {otherTypes.map((b) => <li key={b.slug}><Link href={bodyTypePath(b)} className="text-brand-700 hover:underline">Used {b.label}</Link></li>)}
              <li><Link href="/used-vans" className="text-brand-700 hover:underline">All used vans by make and model</Link></li>
              <li><Link href="/van-finance" className="text-brand-700 hover:underline">Van finance</Link></li>
            </ul>
          </section>
        )}
      </Container>
    </>
  );
}
