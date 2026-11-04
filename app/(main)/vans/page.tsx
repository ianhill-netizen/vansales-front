import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { ListingCard } from "@/components/listing-card";
import { VansFilter } from "@/components/search/vans-filter";
import { Pagination } from "@/components/pagination";
import { MapSplit } from "@/components/map-split";
import { PayToggle, ViewToggle } from "@/components/results-controls";
import { DealerMapButton } from "@/components/dealer-map-button";
import { IconArrow } from "@/components/icons";
import { getListings, getFacets } from "@/lib/listings/client";
import type { Condition, Listing, ListingFilters, Wheelbase } from "@/lib/listings/types";
import { priceFromMonthly, parsePay } from "@/lib/finance";
import { legacyToVehicles, parseVehicles } from "@/lib/vehicle-chips";
import { haversineDistanceMiles } from "@/lib/distance";
import { SITE, absUrl } from "@/lib/site";

const DEALSKI_API = (
  process.env.DEALSKI_API_URL ?? "https://swissvans.dealski.co.uk"
).replace(/\/$/, "");
const MARKETPLACE_KEY = process.env.DEALSKI_MARKETPLACE_KEY ?? "";

async function geocodePostcodeServer(postcode: string): Promise<{ lat: number; lng: number } | null> {
  if (!MARKETPLACE_KEY || !postcode.trim()) return null;
  try {
    const res = await fetch(`${DEALSKI_API}/api/marketplace/geocode`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${MARKETPLACE_KEY}` },
      body: JSON.stringify({ postcode: postcode.trim() }),
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { latitude?: number; longitude?: number };
    if (data.latitude != null && data.longitude != null) {
      return { lat: data.latitude, lng: data.longitude };
    }
  } catch { /* ignore */ }
  return null;
}

export const revalidate = 3600;
const PAGE_SIZE = 24;
const MAP_CAP = 400;

/** Strip the heavy fields (long description, full photo set, feature lists) before a listing is serialised to the client map. */
function forMap(l: Listing): Listing {
  return { ...l, description: "", features: [], extras: [], images: l.images.slice(0, 1), details: undefined };
}

type Search = { [k: string]: string | string[] | undefined };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const num = (v: string | string[] | undefined) => {
  const n = Number(one(v));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

function parseModels(sp: Search): string[] | undefined {
  // ?models=transporter,caddy (preferred) or legacy ?model=transporter
  const raw = one(sp.models);
  if (raw) {
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) return parts;
  }
  const legacy = one(sp.model);
  return legacy ? [legacy] : undefined;
}

function parseFilters(sp: Search, buyerLat?: number, buyerLng?: number): ListingFilters {
  const monthlyMax = num(sp.monthlyMax);
  const deposit = num(sp.deposit) ?? 3000;
  const derivedMaxPrice = monthlyMax ? priceFromMonthly(monthlyMax, deposit) : undefined;
  const rawRadius = num(sp.radius);
  const hasPostcode = !!(one(sp.postcode) || one(sp.near) || "").trim();
  const rawSort = (one(sp.sort) as ListingFilters["sort"]) || undefined;
  const effectiveSort = rawSort ?? (hasPostcode && buyerLat != null ? "nearest" : "newest");
  // Chip search (?v=ford:transit-custom,volkswagen). Legacy ?make= / ?models= / ?model= links become chips too.
  const vehicles = one(sp.v) ? parseVehicles(one(sp.v)) : legacyToVehicles(one(sp.make) || undefined, parseModels(sp));
  // Hero search sends ?near=: a postcode is geocoded, anything else is matched against the town.
  const near = (one(sp.near) || "").trim();
  const nearIsPostcode = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d?[A-Za-z]{0,2}$/.test(near);
  return {
    vehicles:  vehicles.length ? vehicles : undefined,
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
    q: one(sp.q) || (near && !nearIsPostcode ? near : undefined),
    postcode: one(sp.postcode) || (nearIsPostcode ? near : undefined),
    radius: rawRadius,
    buyerLat,
    buyerLng,
    sort: effectiveSort,
    page: num(sp.page) ?? 1,
    pageSize: PAGE_SIZE,
  };
}

function hrefFor(sp: Search, page: number, override: Record<string, string | null> = {}): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...sp, ...override })) {
    if (k === "page") continue;
    const val = one(v ?? undefined);
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
  const nearParam = (one(sp.near) || "").trim();
  const rawPostcode = (one(sp.postcode) || (/\d/.test(nearParam) ? nearParam : "") || "").trim();
  const buyerCoords = rawPostcode ? await geocodePostcodeServer(rawPostcode) : null;
  const filters = parseFilters(sp, buyerCoords?.lat, buyerCoords?.lng);
  const { mode: payMode, terms: financeTerms } = parsePay(sp);
  const view: "grid" | "map" = one(sp.view) === "map" ? "map" : "grid";

  const [result, facets] = await Promise.all([
    getListings(filters),
    getFacets(),
  ]);
  const { listings, total, page, totalPages } = result;

  // Map view needs EVERY match that has a location (not just this page), trimmed so the payload stays small.
  let mapListings: typeof listings = [];
  if (view === "map") {
    const all = await getListings({ ...filters, page: undefined, pageSize: undefined });
    mapListings = all.listings.filter((l) => l.location.lat != null && l.location.lng != null).slice(0, MAP_CAP).map(forMap);
  }
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
            <span className="font-display font-bold text-brand-600">{facets.total.toLocaleString()}</span>{" "}
            {facets.total === 1 ? "van" : "vans"} available
          </p>
        </Container>
      </section>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <Container className="py-8">
        {/* Filter pill row + modal */}
        <VansFilter total={total} facets={facets} searchParams={sp} />

        {/* Results bar: count · Cash/Finance/Both · Grid/Map */}
        <div className="mb-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[var(--text-sm)] text-ink-500">
              {total > 0 ? (
                <>
                  Showing <span className="font-mono font-semibold text-ink-800">{firstOnPage}–{lastOnPage}</span> of{" "}
                  <span className="font-mono font-semibold text-ink-800">{total.toLocaleString()}</span>
                  {page > 1 && <span className="text-ink-400"> · page {page} of {totalPages}</span>}
                </>
              ) : (
                "No vans found"
              )}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <DealerMapButton listings={listings} />
              <ViewToggle view={view} gridHref={hrefFor(sp, 1, { view: null })} mapHref={hrefFor(sp, 1, { view: "map" })} />
            </div>
          </div>
          <PayToggle mode={payMode} terms={financeTerms} />
        </div>

        {listings.length === 0 ? (
          <div className="rounded-[var(--radius-2xl)] border border-dashed border-border bg-white px-8 py-16 text-center shadow-[var(--shadow-xs)]">
            <h2 className="font-display text-[var(--text-xl)] font-bold text-ink-900">No vans match those filters</h2>
            <p className="mx-auto mt-2 max-w-sm text-[var(--text-sm)] text-ink-500">
              Try widening your price or year range, or removing a filter.
            </p>
            <Link
              href="/vans"
              className="mt-5 inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-white px-4 py-2.5 text-[var(--text-sm)] font-semibold text-ink-700 shadow-[var(--shadow-xs)] hover:border-brand-300 hover:text-brand-700"
            >
              Clear filters <IconArrow width={14} height={14} />
            </Link>
          </div>
        ) : view === "map" ? (
          <MapSplit
            listings={mapListings}
            totalMatching={total}
            closeHref={hrefFor(sp, 1, { view: null })}
            payMode={payMode}
            financeTerms={financeTerms}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((l, i) => {
                const distanceMiles =
                  buyerCoords && l.location.lat != null && l.location.lng != null
                    ? haversineDistanceMiles(buyerCoords.lat, buyerCoords.lng, l.location.lat, l.location.lng)
                    : undefined;
                return (
                  <ListingCard
                    key={l.id}
                    listing={l}
                    priority={i < 6}
                    cardIndex={(page - 1) * PAGE_SIZE + i}
                    distanceMiles={distanceMiles}
                    payMode={payMode}
                    financeTerms={financeTerms}
                  />
                );
              })}
            </div>
            <Pagination page={page} totalPages={totalPages} hrefFor={(p) => hrefFor(sp, p)} />
          </>
        )}
      </Container>
    </>
  );
}
