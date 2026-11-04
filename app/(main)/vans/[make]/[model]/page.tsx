import { EmptyState } from "@/components/empty/empty-state";
import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";
import { ListingCard } from "@/components/listing-card";
import { FilterRail } from "@/components/filter-rail";
import { Pagination } from "@/components/pagination";
import { JsonLd } from "@/components/json-ld";
import { IconArrow } from "@/components/icons";
import { SpecCard } from "@/components/spec-card";
import { getListings, getFacets } from "@/lib/listings/client";
import { InternalLinks } from "@/components/seo/internal-links";
import { loadCatalogue, modelStat } from "@/lib/seo/catalogue";
import { modelIntro, priceRange } from "@/lib/seo/intro";
import { categoryLinks, competitorLinks, makeLinks, modelLinksOfMake } from "@/lib/seo/links";
import type { ListingFilters, Wheelbase } from "@/lib/listings/types";
import { listingTitle, listingMeta } from "@/lib/listings/format";
import { listingPath } from "@/lib/listings/slug";
import { MODEL_CONTENT, getModelContent } from "@/lib/models/content.generated";
import { SITE, absUrl } from "@/lib/site";
import { getMakeBySlug, getModelBySlug } from "@/lib/taxonomy/van-makes";

export const revalidate = 3600; // ISR — rebuild every 1 h

/** Pre-render all 35 known make/model paths; unknown combos render on demand. */
export async function generateStaticParams() {
  return Object.values(MODEL_CONTENT).map((c) => ({
    make: c.makeSlug,
    model: c.modelSlug,
  }));
}

const PAGE_SIZE = 24;

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

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

function parseFilters(makeSlug: string, modelSlug: string, sp: Search): ListingFilters {
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
    page: num(sp.page) ?? 1,
    pageSize: PAGE_SIZE,
  };
}

/** Href preserving the CURRENT filters, setting page (omitted for page 1). */
function hrefWithFilters(makeSlug: string, modelSlug: string, sp: Search, page: number): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === "page") continue;
    const val = one(v);
    if (val) params.set(k, val);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return `/vans/${makeSlug}/${modelSlug}${qs ? `?${qs}` : ""}`;
}

/** Clean canonical/series URL: page only, NO filter params (avoids facet dupes). */
function cleanPageUrl(makeSlug: string, modelSlug: string, page: number): string {
  return `/vans/${makeSlug}/${modelSlug}${page > 1 ? `?page=${page}` : ""}`;
}

async function resolve(params: Promise<Params>, searchParams: Promise<Search>) {
  const { make, model } = await params;
  const sp = await searchParams;
  const filters = parseFilters(make, model, sp);
  const result = await getListings(filters);
  const content = getModelContent(make, model);
  // Taxonomy names first (clean "Transit Custom"), then generated content, then the feed's verbose string.
  const makeName = getMakeBySlug(make)?.name ?? content?.make ?? result.listings[0]?.make ?? titleizeSlug(make);
  const modelName = getModelBySlug(make, model)?.name ?? content?.model ?? titleizeSlug(model);
  return { makeSlug: make, modelSlug: model, makeName, modelName, sp, result, content };
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}): Promise<Metadata> {
  const { makeSlug, modelSlug, makeName, modelName, result } = await resolve(params, searchParams);
  const stat = modelStat(await loadCatalogue(), makeSlug, modelSlug);
  const onPage = result.page > 1 ? ` — Page ${result.page}` : "";
  const title = `${makeName} ${modelName} Vans for Sale UK${onPage} | ${SITE.name}`;
  const pr = priceRange(stat);
  const description = stat.count > 0
    ? `Browse ${stat.count.toLocaleString("en-GB")} ${makeName} ${modelName} van${stat.count === 1 ? "" : "s"} for sale in the UK${pr ? `, priced ${pr}` : ""}. Compare mileage, year, wheelbase and fuel type from dealers and private sellers on ${SITE.name}.`
    : `Find ${makeName} ${modelName} vans for sale in the UK on ${SITE.name}. No ${modelName} is listed right now, so compare similar vans from dealers and private sellers.`;
  return {
    title: { absolute: title },
    description,
    // Canonical excludes filter params (facet dupes) but keeps the page number.
    alternates: { canonical: cleanPageUrl(makeSlug, modelSlug, result.page) },
    openGraph: { title, description, url: cleanPageUrl(makeSlug, modelSlug, result.page), type: "website" },
    twitter: { card: "summary_large_image", title, description },
    // No stock = a thin page: out of the index, links still followed.
    ...(stat.count === 0 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ModelPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { makeSlug, modelSlug, makeName, modelName, sp, result, content } = await resolve(params, searchParams);
  const { listings, total, page, totalPages } = result;
  const facets = await getFacets({ make: makeSlug, model: modelSlug });
  const idx = await loadCatalogue();
  const stat = modelStat(idx, makeSlug, modelSlug);
  const intro = modelIntro(stat);

  const firstOnPage = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastOnPage = (page - 1) * PAGE_SIZE + listings.length;

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${makeName} ${modelName} for sale`,
    numberOfItems: total,
    itemListElement: listings.map((l, i) => ({
      "@type": "ListItem",
      position: (page - 1) * PAGE_SIZE + i + 1,
      url: absUrl(listingPath(l)),
      name: listingTitle(l),
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
      { "@type": "ListItem", position: 2, name: `${makeName} vans`, item: absUrl(`/vans/${makeSlug}`) },
      { "@type": "ListItem", position: 3, name: `${makeName} ${modelName}`, item: absUrl(`/vans/${makeSlug}/${modelSlug}`) },
    ],
  };

  return (
    <>
      <JsonLd data={[itemList, breadcrumbLd]} />
      {/* rel prev/next for the paginated series (React 19 hoists to <head>) */}
      {page > 1 && <link rel="prev" href={absUrl(cleanPageUrl(makeSlug, modelSlug, page - 1))} />}
      {page < totalPages && <link rel="next" href={absUrl(cleanPageUrl(makeSlug, modelSlug, page + 1))} />}

      {/* Page header — light hero band */}
      <section className="border-b border-border bg-surface-1">
        <Container className="py-7">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link>
            <span aria-hidden>/</span>
            <Link href={`/vans/${makeSlug}`} className="hover:text-ink-900">{makeName} vans</Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-ink-700">{makeName} {modelName}</span>
          </nav>

          <div className="grid items-center gap-6 lg:grid-cols-[1fr_minmax(0,440px)]">
            <div>
              <Eyebrow>{makeName}</Eyebrow>
              <h1 className="mt-2 font-display text-[var(--text-3xl)] font-extrabold leading-tight text-ink-900">
                {makeName} {modelName} vans for sale
              </h1>
              {/* Unique intro written from this model's real stock (page 1 only, so paginated pages stay lean) */}
              {page === 1 && (
                <div className="mt-3 max-w-2xl space-y-3 text-[var(--text-md)] leading-relaxed text-ink-600">
                  {intro.map((p, i) => <p key={i}>{p}</p>)}
                </div>
              )}
              <p className="mt-4 text-[var(--text-sm)] font-semibold text-ink-600">
                <span className="font-mono text-brand-700">{total}</span>{" "}
                {total === 1 ? "van" : "vans"} available now
              </p>
            </div>

            <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] bg-surface-2 ring-1 ring-border">
              {listings[0]?.images[0]?.url.startsWith("http") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listings[0].images[0].url}
                  alt={listings[0].images[0].alt}
                  className="size-full object-cover"
                />
              ) : (
                <SpecCard
                  listing={{
                    make: makeName,
                    model: modelName,
                    van_spec: listings[0]?.van_spec ?? { body_style: undefined, wheelbase: null, roof_height: null, payload_kg: null, load_length_mm: null, doors: null },
                  }}
                  className="size-full"
                />
              )}
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-8">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Filters */}
          <div>
            <FilterRail
              resultCount={total}
              fuels={facets.fuels.map((f) => f.value)}
              bodyStyles={facets.bodyStyles.map((b) => b.value)}
            />
          </div>

          {/* Results */}
          <div>
            {total > 0 && (
              <p className="mb-4 text-[var(--text-sm)] text-ink-500">
                Showing <span className="font-mono text-ink-800">{firstOnPage}</span>–
                <span className="font-mono text-ink-800">{lastOnPage}</span> of{" "}
                <span className="font-mono text-ink-800">{total}</span>
                {page > 1 ? ` · page ${page} of ${totalPages}` : ""}
              </p>
            )}

            {listings.length === 0 ? (
              <EmptyState
                illustration="no-vans"
                title={`No ${modelName} vans match those filters`}
                body="Try widening your price or year range, or clearing a filter to see more stock."
                action={{ label: "Clear filters", href: `/vans/${makeSlug}/${modelSlug}` }}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {listings.map((l, i) => (
                    <ListingCard key={l.id} listing={l} priority={i < 3} cardIndex={(page - 1) * PAGE_SIZE + i} />
                  ))}
                </div>
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  hrefFor={(p) => hrefWithFilters(makeSlug, modelSlug, sp, p)}
                />
              </>
            )}

            {/* SEO intro copy — page 1 only (keeps paginated pages lean & non-duplicate) */}
            {page === 1 && content?.intro?.length ? (
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
                    <Link href={listingPath(listings[0])} className="font-semibold text-brand-700 hover:underline">
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

      {/* ── Internal link network ───────────────────────────────────────── */}
      <section className="border-t border-border bg-surface-1 py-10">
        <Container className="space-y-9">
          <InternalLinks title={`Other ${makeName} vans`} links={[{ href: `/vans/${makeSlug}`, label: `All ${makeName} vans for sale` }, ...modelLinksOfMake(makeSlug, modelSlug)]} columns={3} />
          <InternalLinks title="Similar vans for sale" links={competitorLinks(makeSlug, modelSlug)} columns={3} />
          <InternalLinks title="Browse by body type" links={categoryLinks()} columns={3} />
          <InternalLinks title="Browse by make" links={makeLinks()} columns={4} />
        </Container>
      </section>
    </>
  );
}
