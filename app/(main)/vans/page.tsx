import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { ListingCard } from "@/components/listing-card";
import { VansFilter } from "@/components/search/vans-filter";
import { Pagination } from "@/components/pagination";
import { ListMapToggle } from "@/components/list-map-toggle";
import { IconArrow } from "@/components/icons";
import { getListings, getFacets } from "@/lib/listings/client";
import type { Condition, ListingFilters, Wheelbase } from "@/lib/listings/types";
import { priceFromMonthly } from "@/lib/finance";
import { SITE, absUrl } from "@/lib/site";

export const revalidate = 3600;
const PAGE_SIZE = 24;

type Search = { [k: string]: string | string[] | undefined };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const num = (v: string | string[] | undefined) => {
  const n = Number(one(v));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

function parseFilters(sp: Search): ListingFilters {
  const monthlyMax = num(sp.monthlyMax);
  const deposit = num(sp.deposit) ?? 3000;
  const derivedMaxPrice = monthlyMax ? priceFromMonthly(monthlyMax, deposit) : undefined;
  return {
    make:      one(sp.make)      || undefined,
    model:     one(sp.model)     || undefined,
    condition: (one(sp.condition) as Condition) || undefined,
    bodyStyle: one(sp.bodyStyle) || undefined,
    fuel:      one(sp.fuel)      || undefined,
    wheelbase: (one(sp.wheelbase) as Wheelbase) || undefined,
    gearbox:   one(sp.gearbox)   || undefined,
    colour:    one(sp.colour)    || undefined,
    minPrice:  num(sp.minPrice),
    maxPrice:  num(sp.maxPrice) ?? derivedMaxPrice,
    minYear:   num(sp.minYear),
    maxYear:   num(sp.maxYear),
    maxMileage: num(sp.maxMileage),
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

export async function generateMetadata(): Promise<Metadata> {
  const title = "Vans for sale";
  const description = `Browse new and used vans for sale across the UK on ${SITE.name}. Filter by make, model, price, wheelbase and more.`;
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
  const firstOnPage = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastOnPage  = (page - 1) * PAGE_SIZE + listings.length;

  return (
    <>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-white">
        <Container className="py-7">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-700">Home</Link>
            <span aria-hidden className="text-ink-300">/</span>
            <span className="font-medium text-ink-600">Vans for sale</span>
          </nav>

          <h1 className="font-display text-[var(--text-3xl)] font-extrabold leading-[1.05] tracking-[var(--tracking-display)] text-ink-900">
            Vans for sale
          </h1>
          <p className="mt-2 text-[var(--text-md)] text-ink-500">
            <span className="font-display font-bold text-brand-600">{total.toLocaleString()}</span>{" "}
            {total === 1 ? "van" : "vans"} available
          </p>
        </Container>
      </section>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <Container className="py-8">
        {/* Filter pill row + modal */}
        <VansFilter total={total} facets={facets} searchParams={sp} />

        {/* Results count bar */}
        {total > 0 && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[var(--text-sm)] text-ink-500">
              Showing{" "}
              <span className="font-mono font-semibold text-ink-800">{firstOnPage}–{lastOnPage}</span>{" "}
              of{" "}
              <span className="font-mono font-semibold text-ink-800">{total.toLocaleString()}</span>
              {page > 1 && (
                <span className="text-ink-400"> · page {page} of {totalPages}</span>
              )}
            </p>
          </div>
        )}

        {listings.length === 0 ? (
          <div className="rounded-[var(--radius-2xl)] border border-dashed border-border bg-white px-8 py-16 text-center shadow-[var(--shadow-xs)]">
            <p className="font-mono text-4xl text-ink-200">🔍</p>
            <h2 className="mt-4 font-display text-[var(--text-xl)] font-bold text-ink-900">
              No vans match those filters
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-[var(--text-sm)] text-ink-500">
              Try widening your price or year range, or removing a filter.
            </p>
            <Link
              href="/vans"
              className="mt-5 inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-white px-4 py-2.5 text-[var(--text-sm)] font-semibold text-ink-700 shadow-[var(--shadow-xs)] hover:border-brand-300 hover:text-brand-700"
            >
              Clear all filters <IconArrow width={14} height={14} />
            </Link>
          </div>
        ) : (
          <ListMapToggle listings={listings}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
      </Container>
    </>
  );
}
