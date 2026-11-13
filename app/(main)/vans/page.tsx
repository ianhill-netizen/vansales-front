import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { ListingCard } from "@/components/listing-card";
import { VansFilter } from "@/components/search/vans-filter";
import { QuickFilters } from "@/components/quick-filters";
import { LocationBar } from "@/components/location/location-bar";
import { Pagination } from "@/components/pagination";
import { MapSplit } from "@/components/map-split";
import { PayToggle, ViewToggle } from "@/components/results-controls";
import { isSwissVans } from "@/lib/listings/finance-scope";
import { vatOnTop } from "@/lib/listings/vat";
import { FinanceDisclosure } from "@/components/finance/finance-disclosure";
import { EmptyState } from "@/components/empty/empty-state";
import { getListings, getFacets } from "@/lib/listings/client";
import { getPickerData } from "@/lib/listings/picker";
import type { Condition, Listing, ListingFilters, Wheelbase } from "@/lib/listings/types";
import { priceFromMonthly, parsePay } from "@/lib/finance";
import { getFinanceConfig, type FinanceConfig } from "@/lib/finance-config";
import { legacyToVehicles, parseVehicles } from "@/lib/vehicle-chips";
import { haversineDistanceMiles } from "@/lib/distance";
import { absUrl, DEFAULT_OG_IMAGES } from "@/lib/site";

const DEALSKI_API = (
  process.env.DEALSKI_API_URL ?? "https://swissvans.dealski.co.uk"
).replace(/\/$/, "");
const MARKETPLACE_KEY = process.env.DEALSKI_MARKETPLACE_KEY ?? "";

async function geocodePostcodeFree(postcode: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.replace(/\s+/g, ""))}`, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const d = (await res.json()) as { result?: { latitude?: number; longitude?: number } };
    return d.result?.latitude != null && d.result?.longitude != null ? { lat: d.result.latitude, lng: d.result.longitude } : null;
  } catch {
    return null;
  }
}

async function geocodePostcodeServer(postcode: string): Promise<{ lat: number; lng: number } | null> {
  if (!postcode.trim()) return null;
  if (!MARKETPLACE_KEY) return geocodePostcodeFree(postcode);
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
  } catch { /* fall through to the free service */ }
  return geocodePostcodeFree(postcode);
}

export const revalidate = 300; // 5 min: counts come from the vansales API (60 s data cache), so an hour showed stale "0 vans"
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

function parseFilters(sp: Search, fin: FinanceConfig, buyerLat?: number, buyerLng?: number): ListingFilters {
  const monthlyMax = num(sp.monthlyMax);
  const deposit = num(sp.deposit) ?? 3000;
  const derivedMaxPrice = monthlyMax ? priceFromMonthly(monthlyMax, deposit, fin.apr, fin.termMonths) : undefined;
  const rawRadius = num(sp.radius);
  const rawSort = (one(sp.sort) as ListingFilters["sort"]) || undefined;
  const effectiveSort = rawSort ?? (buyerLat != null ? "nearest" : "newest");
  // Chip search (?v=ford:transit-custom,volkswagen). Legacy ?make= / ?models= / ?model= links become chips too.
  const vehicles = one(sp.v) ? parseVehicles(one(sp.v)) : legacyToVehicles(one(sp.make) || undefined, parseModels(sp));
  // Hero search sends ?near=: a postcode is geocoded, anything else is matched against the town.
  const near = (one(sp.near) || "").trim();
  const nearIsPostcode = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d?[A-Za-z]{0,2}$/.test(near);
  return {
    vehicles:  vehicles.length ? vehicles : undefined,
    dealer:    one(sp.dealer)    || undefined,
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
    ulez: one(sp.ulez) === "1" || one(sp.ulez) === "true" ? true : undefined,
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

// Search and filter URLs (/vans?bodyStyle=luton, ?v=ford:transit, ?near=...) are views of the same listing, not pages to rank: noindex,follow. The plain /vans (and its ?page=N) stay indexable.
const FILTER_KEYS = ["v", "make", "model", "models", "bodyStyle", "fuel", "condition", "wheelbase", "gearbox", "colour", "minPrice", "maxPrice", "minYear", "maxYear", "maxMileage", "ulez", "q", "near", "postcode", "dealer", "radius", "lat", "lng", "loc", "monthlyMax", "sort"];

export async function generateMetadata({ searchParams }: { searchParams: Promise<Search> }): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = FILTER_KEYS.some((k) => one(sp[k]) !== undefined && one(sp[k]) !== "");
  const title = "Used Vans for Sale UK | Vansales.com";
  const description = "Browse used vans for sale across the UK from dealers and private sellers. Filter by make, body type, payload, ULEZ and mileage.";
  return {
    title: { absolute: title },   // this exact string: the layout's " · Vansales" template is not appended
    description,
    alternates: { canonical: absUrl("/vans") },
    ...(filtered ? { robots: { index: false, follow: true } } : {}),
    openGraph: { images: DEFAULT_OG_IMAGES, title, description, url: absUrl("/vans"), type: "website" },
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
  // "Near me" sends coordinates directly (?lat&lng&loc); a typed postcode / ?near= is geocoded.
  const qLat = Number(one(sp.lat)), qLng = Number(one(sp.lng));
  const directCoords = one(sp.lat) && one(sp.lng) && qLat > 49 && qLat < 61.5 && qLng > -9 && qLng < 2.5 ? { lat: qLat, lng: qLng } : null;
  const buyerCoords = directCoords ?? (rawPostcode ? await geocodePostcodeServer(rawPostcode) : null);
  const fin = await getFinanceConfig();   // the admin finance settings, fetched once and passed down (fallback 11.4% / 60 months)
  const filters = parseFilters(sp, fin, buyerCoords?.lat, buyerCoords?.lng);
  const { mode: requestedPayMode, terms: financeTerms } = parsePay(sp, fin);
  const view: "grid" | "map" = one(sp.view) === "map" ? "map" : "grid";

  const [result, facets] = await Promise.all([
    getListings(filters),
    getFacets(),
  ]);
  const { listings, total, page, totalPages } = result;
  // Finance UI is Swiss Vans stock only: the toggle, monthly figures and the example exist only when this page shows a Swiss Vans van; otherwise the page is cash-only.
  const swissOnPage = listings.filter(isSwissVans);
  const payMode = swissOnPage.length > 0 ? requestedPayMode : "cash";
  const exampleVan = swissOnPage.find((l) => l.price != null && l.price > 0);

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
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[length:var(--text-sm)] text-ink-400">
            <Link href="/" className="hover:text-ink-700">Home</Link>
            <span aria-hidden className="text-ink-300">/</span>
            <span className="font-medium text-ink-600">Vans for sale</span>
          </nav>

          <h1 className="font-display text-[length:var(--text-3xl)] font-extrabold leading-[1.05] tracking-[var(--tracking-display)] text-ink-900">
            Used Vans for Sale
          </h1>
          <p className="mt-2 text-[length:var(--text-md)] text-ink-500">
            <span className="font-display font-bold text-brand-600">{facets.total.toLocaleString()}</span>{" "}
            {facets.total === 1 ? "van" : "vans"} available
          </p>
          <p className="mt-2 max-w-3xl text-[length:var(--text-sm)] text-ink-500">
            Browse used vans for sale across the UK from dealers and private sellers. Filter by make, body type, payload, ULEZ and mileage to find the right van.
          </p>
        </Container>
      </section>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <Container className="py-8">
        {/* The active location and radius: Change opens the postcode box inline; radius pills widen without a new search */}
        <LocationBar
          postcode={directCoords || rawPostcode ? (one(sp.postcode) || rawPostcode).toUpperCase() : ""}
          town={one(sp.loc) || ""}
          radius={one(sp.radius) || "25"}
          lat={buyerCoords?.lat}
          lng={buyerCoords?.lng}
          hrefs={Object.fromEntries(["10", "25", "50", "100", "national"].map((r) => [r, hrefFor(sp, 1, { radius: r })]))}
          base={Object.fromEntries(Object.entries(sp).filter(([k]) => !["postcode", "lat", "lng", "loc", "near", "radius", "page"].includes(k)).map(([k, v]) => [k, one(v) ?? ""]).filter(([, v]) => v))}
        />

        {/* Filter pill row + modal */}
        <VansFilter finance={{ apr: fin.apr, termMonths: fin.termMonths }} total={total} facets={facets} picker={await getPickerData()} searchParams={sp} quickFilters={<QuickFilters sp={sp} />} />

        {/* Results bar: count · Cash/Finance/Both · Grid/Map */}
        <div className="mb-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[length:var(--text-sm)] text-ink-500">
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
              <ViewToggle view={view} gridHref={hrefFor(sp, 1, { view: null })} mapHref={hrefFor(sp, 1, { view: "map" })} />
            </div>
          </div>
          {swissOnPage.length > 0 && <PayToggle mode={payMode} terms={financeTerms} defaults={{ termMonths: fin.termMonths, apr: fin.apr }} />}
          {payMode !== "cash" && exampleVan && (
            <FinanceDisclosure example={{ price: exampleVan.price!, warranties: exampleVan.warranty_addons ?? [], finance: exampleVan.finance ?? null, vatQualifying: vatOnTop(exampleVan.vat_status) }} />
          )}
        </div>

        {listings.length === 0 ? (
          <EmptyState
            illustration="no-vans"
            title="No vans match those filters"
            body="Try widening your price or year range, or removing a filter."
            action={{ label: "Clear filters", href: "/vans" }}
            className="py-14"
          />
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
