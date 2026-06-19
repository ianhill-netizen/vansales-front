import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";
import { ListingCard } from "@/components/listing-card";
import { FilterRail } from "@/components/filter-rail";
import { Pagination } from "@/components/pagination";
import { ListMapToggle } from "@/components/list-map-toggle";
import { IconArrow } from "@/components/icons";
import { getListings, getFacets } from "@/lib/listings/client";
import type { Condition, ListingFilters, Wheelbase } from "@/lib/listings/types";
import { SITE, absUrl } from "@/lib/site";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 24;

type Search = { [k: string]: string | string[] | undefined };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const num = (v: string | string[] | undefined) => {
  const n = Number(one(v));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

function parseFilters(sp: Search): ListingFilters {
  return {
    condition: (one(sp.condition) as Condition) || undefined,
    bodyStyle: one(sp.bodyStyle) || undefined,
    fuel: one(sp.fuel) || undefined,
    minPrice: num(sp.minPrice),
    maxPrice: num(sp.maxPrice),
    minYear: num(sp.minYear),
    maxYear: num(sp.maxYear),
    sort: (one(sp.sort) as ListingFilters["sort"]) || "newest",
    page: num(sp.page) ?? 1,
    pageSize: PAGE_SIZE,
  };
}

function hrefFor(sp: Search, page: number): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === "page") continue;
    const val = one(v);
    if (val) params.set(k, val);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return `/vans${qs ? `?${qs}` : ""}`;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Search>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const condition = one(sp.condition);
  const label = condition === "new" ? "New" : condition === "used" ? "Used" : "New &amp; used";
  const title = `${label} vans for sale`;
  const description = `Browse ${label.toLowerCase()} vans for sale across the UK on ${SITE.name}. Filter by make, model, price, wheelbase and ULEZ status.`;
  return {
    title,
    description,
    alternates: { canonical: absUrl("/vans") },
    openGraph: { title: `${title} · ${SITE.name}`, description, url: absUrl("/vans"), type: "website" },
  };
}

export default async function VansPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const [result, facets] = await Promise.all([
    getListings(filters),
    getFacets(),
  ]);
  const { listings, total, page, totalPages } = result;
  const condition = one(sp.condition);
  const conditionLabel = condition === "new" ? "New vans" : condition === "used" ? "Used vans" : "All vans";
  const firstOnPage = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastOnPage = (page - 1) * PAGE_SIZE + listings.length;

  return (
    <>
      {/* Header band */}
      <section className="border-b border-border bg-surface-1">
        <Container className="py-7">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-900">Home</Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-ink-700">{conditionLabel} for sale</span>
          </nav>
          <Eyebrow>{conditionLabel}</Eyebrow>
          <h1 className="mt-2 font-display text-[var(--text-3xl)] font-extrabold leading-tight text-ink-900">
            {conditionLabel} for sale
          </h1>
          <p className="mt-2 text-[var(--text-md)] text-ink-600">
            <span className="font-mono font-bold text-brand-600">{total.toLocaleString()}</span>{" "}
            {total === 1 ? "van" : "vans"} available
          </p>
          {/* Condition tabs */}
          <div className="mt-4 flex gap-2">
            {[
              { label: "All vans", href: "/vans" },
              { label: "Used", href: "/vans?condition=used" },
              { label: "New", href: "/vans?condition=new" },
            ].map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-[var(--radius-pill)] px-4 py-1.5 text-[var(--text-sm)] font-semibold transition-colors ${
                  (tab.label === "All vans" && !condition) ||
                  (tab.label === "Used" && condition === "used") ||
                  (tab.label === "New" && condition === "new")
                    ? "bg-ink-900 text-white"
                    : "border border-border bg-white text-ink-600 hover:border-ink-400"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Filter rail */}
          <FilterRail
            resultCount={total}
            fuels={facets.fuels.map((f) => f.value)}
            bodyStyles={facets.bodyStyles.map((b) => b.value)}
          />

          {/* Results */}
          <div>
            {total > 0 && (
              <p className="mb-4 text-[var(--text-sm)] text-ink-500">
                Showing <span className="font-mono text-ink-800">{firstOnPage}</span>–
                <span className="font-mono text-ink-800">{lastOnPage}</span> of{" "}
                <span className="font-mono text-ink-800">{total.toLocaleString()}</span>
                {page > 1 ? ` · page ${page} of ${totalPages}` : ""}
              </p>
            )}

            {listings.length === 0 ? (
              <div className="rounded-[var(--radius-lg)] border border-dashed border-border-strong bg-card p-10 text-center">
                <h2 className="font-display text-[var(--text-xl)] font-bold text-ink-900">No vans match those filters</h2>
                <p className="mx-auto mt-2 max-w-sm text-[var(--text-sm)] text-ink-500">
                  Try widening your price or year range, or clearing a filter.
                </p>
                <Link href="/vans" className="mt-4 inline-flex items-center gap-1.5 text-[var(--text-sm)] font-semibold text-brand-700 hover:underline">
                  Clear filters <IconArrow width={16} height={16} />
                </Link>
              </div>
            ) : (
              <ListMapToggle listings={listings}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {listings.map((l, i) => (
                    <ListingCard key={l.id} listing={l} priority={i < 6} cardIndex={(page - 1) * PAGE_SIZE + i} />
                  ))}
                </div>
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  hrefFor={(p) => hrefFor(sp, p)}
                />
              </ListMapToggle>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
