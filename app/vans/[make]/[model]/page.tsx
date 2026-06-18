import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow, Badge } from "@/components/ui";
import { ListingCard } from "@/components/listing-card";
import { FilterRail } from "@/components/filter-rail";
import { JsonLd } from "@/components/json-ld";
import { IconArrow } from "@/components/icons";
import { getListings } from "@/lib/listings/client";
import type { ListingFilters, Wheelbase } from "@/lib/listings/types";
import { listingTitle, listingMeta } from "@/lib/listings/format";
import { listingPath } from "@/lib/listings/slug";
import { getModelSeed } from "@/lib/seed";
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
  // Prefer canonical casing from real data; fall back to a titleized slug.
  const makeName = result.listings[0]?.make ?? titleizeSlug(make);
  const modelName = result.listings[0]?.model ?? titleizeSlug(model);
  return { makeSlug: make, modelSlug: model, makeName, modelName, sp, result };
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}): Promise<Metadata> {
  const { makeSlug, modelSlug, makeName, modelName, result } = await resolve(params, searchParams);
  const title = `${makeName} ${modelName} for sale`;
  const description = `Browse ${result.total} ${makeName} ${modelName} vans for sale across the UK on ${SITE.name}. Filter by price, year, wheelbase, body style and fuel. Full spec and ULEZ status on every listing.`;
  const canonical = `/vans/${makeSlug}/${modelSlug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title: `${title} · ${SITE.name}`, description, url: canonical, type: "website" },
  };
}

export default async function ModelPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { makeSlug, modelSlug, makeName, modelName, result } = await resolve(params, searchParams);
  const { listings, total } = result;
  const seed = getModelSeed(makeSlug, modelSlug, { make: makeName, model: modelName });
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

      {/* Page header */}
      <section className="border-b border-border bg-surface-0">
        <Container className="py-7">
          <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-[var(--text-sm)] text-ink-500">
            <Link href="/" className="hover:text-ink-800">Home</Link>
            <span aria-hidden>/</span>
            <Link href="/#browse" className="hover:text-ink-800">Vans</Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-ink-700">{makeName} {modelName}</span>
          </nav>

          <Eyebrow>{makeName}</Eyebrow>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <h1 className="font-display text-[var(--text-3xl)] font-extrabold leading-tight text-ink-900">
              {makeName} {modelName} for sale
            </h1>
            <p className="text-[var(--text-md)] font-semibold text-ink-600">
              <span className="font-mono text-ink-900">{total}</span> {total === 1 ? "van" : "vans"} found
            </p>
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
                  No {modelName}s match those filters
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

            {/* SEO intro copy block */}
            <section className="mt-12 border-t border-border pt-8">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-[var(--text-xl)] font-bold text-ink-900">
                  Buying a {makeName} {modelName}
                </h2>
                {seed.source === "seed" && <Badge tone="brand">Editorial</Badge>}
              </div>
              <div className="mt-3 max-w-3xl space-y-4 text-[var(--text-md)] leading-relaxed text-ink-600">
                {seed.intro.map((p, i) => (
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
          </div>
        </div>
      </Container>
    </>
  );
}
