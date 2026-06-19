import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Container, Eyebrow } from "@/components/ui";
import { ListingCard } from "@/components/listing-card";
import { FilterRail } from "@/components/filter-rail";
import { JsonLd } from "@/components/json-ld";
import { IconArrow } from "@/components/icons";
import { getListings } from "@/lib/listings/client";
import type { ListingFilters, Wheelbase } from "@/lib/listings/types";
import { listingTitle, listingMeta } from "@/lib/listings/format";
import { listingPath } from "@/lib/listings/slug";
import { getModelContent } from "@/lib/models/content.generated";
import { SITE, absUrl } from "@/lib/site";

export const dynamic = "force-dynamic"; // filters live in searchParams

type Params = { make: string; model: string };
type Search = { [k: string]: string | string[] | undefined };

const NAME_OVERRIDES: Record<string, string> = {
  vw: "Volkswagen",
  volkswagen: "Volkswagen",
  "mercedes-benz": "Mercedes-Benz",
  citroen: "Citroën",
  bmw: "BMW",
};

function titleizeSlug(slug: string): string {
  if (NAME_OVERRIDES[slug]) return NAME_OVERRIDES[slug];
  return slug
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : `${s.slice(0, n - 1).replace(/\s+\S*$/, "")}…`;
}

function parseFilters(makeSlug: string, modelSlug: string, sp: Search): ListingFilters {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const num = (v: string | string[] | undefined) => {
    const n = Number(one(v));
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };
  return {
    make: makeSlug,
    model: modelSlug,
    minPrice: num(sp.minPrice),
    maxPrice: num(sp.maxPrice),
    minYear: num(sp.minYear),
    maxYear: num(sp.maxYear),
    bodyStyle: one(sp.bodyStyle) || undefined,
    wheelbase: (one(sp.wheelbase) as Wheelbase) || undefined,
    fuel: one(sp.fuel) || undefined,
    sort: (one(sp.sort) as ListingFilters["sort"]) || "newest",
  };
}

async function resolve(params: Promise<Params>, searchParams: Promise<Search>) {
  const { make, model } = await params;
  const sp = await searchParams;
  const filters = parseFilters(make, model, sp);
  const result = await getListings(filters);
  const content = getModelContent(make, model);
  // Prefer the curated/canonical name, then real feed data, then a titleized slug.
  const makeName = content?.make ?? result.listings[0]?.make ?? titleizeSlug(make);
  const modelName = content?.model ?? result.listings[0]?.model ?? titleizeSlug(model);
  return { makeSlug: make, modelSlug: model, makeName, modelName, sp, result, content };
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}): Promise<Metadata> {
  const { makeSlug, modelSlug, makeName, modelName, result, content } = await resolve(params, searchParams);
  const title = `${makeName} ${modelName} for sale`;
  const description = content?.intro?.length
    ? truncate(`${makeName} ${modelName} vans for sale on ${SITE.name}. ${content.intro[0]}`, 160)
    : `Browse ${result.total} ${makeName} ${modelName} vans for sale across the UK on ${SITE.name}. Filter by price, year, wheelbase, body style and fuel.`;
  const canonical = `/vans/${makeSlug}/${modelSlug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} · ${SITE.name}`,
      description,
      url: canonical,
      type: "website",
      images: content?.hero ? [{ url: content.hero }] : undefined,
    },
  };
}

export default async function ModelPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { makeSlug, modelSlug, makeName, modelName, result, content } = await resolve(params, searchParams);
  const { listings, total } = result;
  const canonical = `/vans/${makeSlug}/${modelSlug}`;

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${makeName} ${modelName} for sale`,
    numberOfItems: listings.length,
    itemListElement: listings.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absUrl(listingPath(l)),
      name: listingTitle(l),
    })),
  };

  return (
    <>
      <JsonLd data={itemList} />

      {/* Page header — hero band */}
      <section className="border-b border-border bg-ink-900 text-white">
        <Container className="py-7">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[var(--text-sm)] text-white/55">
            <Link href="/" className="hover:text-white">Home</Link>
            <span aria-hidden>/</span>
            <Link href="/#browse" className="hover:text-white">Vans</Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-white/80">{makeName} {modelName}</span>
          </nav>

          <div className="grid items-center gap-6 lg:grid-cols-[1fr_minmax(0,440px)]">
            <div>
              <Eyebrow className="text-accent-400">{makeName}</Eyebrow>
              <h1 className="mt-2 font-display text-[var(--text-3xl)] font-extrabold leading-tight">
                {makeName} {modelName} for sale
              </h1>
              {content?.intro?.[0] && (
                <p className="mt-3 max-w-xl text-[var(--text-md)] leading-relaxed text-white/70">
                  {truncate(content.intro[0], 180)}
                </p>
              )}
              <p className="mt-4 text-[var(--text-sm)] font-semibold text-white/80">
                <span className="font-mono text-accent-400">{total}</span>{" "}
                {total === 1 ? "van" : "vans"} available now
              </p>
            </div>

            {content?.hero && (
              <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] bg-surface-2 ring-1 ring-white/10">
                <Image
                  src={content.hero}
                  alt={content.heroAlt || `${makeName} ${modelName}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 440px"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </Container>
      </section>

      <Container className="py-8">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Filters */}
          <div>
            <FilterRail resultCount={total} />
          </div>

          {/* Results */}
          <div>
            {listings.length === 0 ? (
              <div className="rounded-[var(--radius-lg)] border border-dashed border-border-strong bg-card p-10 text-center">
                <h2 className="font-display text-[var(--text-xl)] font-bold text-ink-900">
                  No {modelName} vans match those filters
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-[var(--text-sm)] text-ink-500">
                  Try widening your price or year range, or clearing a filter to see more stock.
                </p>
                <Link
                  href={canonical}
                  className="mt-4 inline-flex items-center gap-1.5 text-[var(--text-sm)] font-semibold text-accent-600 hover:underline"
                >
                  Clear filters <IconArrow width={16} height={16} />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {listings.map((l, i) => (
                  <ListingCard key={l.id} listing={l} priority={i < 3} />
                ))}
              </div>
            )}

            {/* SEO intro copy block — real, sanitised content harvested from the model's page */}
            {content?.intro?.length ? (
              <section className="mt-12 border-t border-border pt-8">
                <h2 className="font-display text-[var(--text-xl)] font-bold text-ink-900">
                  Buying a {makeName} {modelName}
                </h2>
                <div className="mt-3 max-w-3xl space-y-4 text-[var(--text-md)] leading-relaxed text-ink-600">
                  {content.intro.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
                {listings[0] && (
                  <p className="mt-4 text-[var(--text-sm)] text-ink-500">
                    Popular pick:{" "}
                    <Link href={listingPath(listings[0])} className="font-semibold text-accent-600 hover:underline">
                      {listingTitle(listings[0])}
                    </Link>{" "}
                    — {listingMeta(listings[0])}.
                  </p>
                )}
              </section>
            ) : null}
          </div>
        </div>
      </Container>
    </>
  );
}
