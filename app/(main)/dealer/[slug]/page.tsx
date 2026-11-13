import { fitTitle } from "@/lib/seo/title";
import { DealerLogo } from "@/components/dealer-logo";
import { EmptyState } from "@/components/empty/empty-state";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ValueYourVan } from "@/components/px/value-your-van";
import { getDealerConfig, whatsappUrl, financeUrl, type DealerConfig } from "@/lib/dealers/config";
import { fetchApiDealerProfile, type ApiDealer } from "@/lib/dealers/api";
import { SocialLinks, hasSocials } from "@/components/social-links";
import { getListings } from "@/lib/listings/client";
import { listingPath } from "@/lib/listings/slug";
import { fetchNativeDbListings } from "@/lib/listings/sources/db";
import { prisma } from "@/lib/prisma";
import { geocodeTown } from "@/lib/geocoding";
import { Container } from "@/components/ui";
import { ListingCard } from "@/components/listing-card";
import { JsonLd } from "@/components/json-ld";
import { DealerCTAButtons } from "@/components/dealer-cta-buttons";
import { DealerStockMap } from "@/components/dealer-stock-map";
import { safeDb } from "@/lib/db-safe";
import {
  IconPin,
  IconClock,
  IconGlobe,
  IconExternalLink,
  IconCheck,
  IconPhone,
  IconStar,
  IconWhatsApp,
} from "@/components/icons";
import { SITE, absUrl, DEFAULT_OG_IMAGES } from "@/lib/site";
import { Photo } from "@/components/photo";

// 5 minutes: a dealer portal profile edit (about, hours, logo) shows within minutes; the Dealski-fed dealers are unaffected by the shorter window.
export const revalidate = 300;

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const dealer = getDealerConfig(slug);
  if (dealer) {
    const title = `${dealer.name} — Van Dealer in ${dealer.location.town}`;
    const description = `${dealer.name} is a van dealer in ${dealer.location.town}, ${dealer.location.county}. Browse their stock on ${SITE.name}.`;
    return { title: fitTitle(title, " · Vansales"), description, alternates: { canonical: `/dealer/${slug}` }, openGraph: { images: DEFAULT_OG_IMAGES, title, description, url: `/dealer/${slug}`, type: "website" } };
  }
  const api = await fetchApiDealerProfile(slug);
  if (api.kind === "ok") {
    const d = api.dealer;
    const title = `${d.name} — Van Dealer${d.town ? ` in ${d.town}` : ""}`;
    const description = `${d.name}${d.town ? ` is a van dealer in ${d.town}` : " sells vans"}. Browse ${d.stock_count > 0 ? `their ${d.stock_count} van${d.stock_count === 1 ? "" : "s"}` : "their stock"} on ${SITE.name}.`;
    return { title: fitTitle(title, " · Vansales"), description, alternates: { canonical: `/dealer/${slug}` }, openGraph: { title, description, url: `/dealer/${slug}`, type: "website", images: d.logo_url ? [{ url: d.logo_url }] : DEFAULT_OG_IMAGES } };
  }
  const dbDealer = await safeDb("dealer metadata lookup", () => prisma.dealer.findUnique({ where: { slug } }), null);
  if (!dbDealer) return { title: api.kind === "error" ? "Van dealer" : "Dealer not found" };
  const town = (dbDealer.location ?? "").split(",")[0].trim() || "UK";
  const title = `${dbDealer.name} — Van Dealer${town ? ` in ${town}` : ""}`;
  const description = `Browse ${dbDealer.name}'s stock on ${SITE.name}.`;
  return { title: fitTitle(title, " · Vansales"), description, alternates: { canonical: `/dealer/${slug}` }, openGraph: { images: DEFAULT_OG_IMAGES, title, description, url: `/dealer/${slug}`, type: "website" } };
}

const DAY_LABELS: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

type Hours = Record<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun", { open: string; close: string } | null>;
const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

/** What the page renders: a config dealer as it is, or a vansales-API / database dealer shaped like one (plus the optional extras). */
type ProfileDealer = Omit<DealerConfig, "hours" | "coverUrl"> & {
  hours: Hours;
  logoUrl?: string | null;
  coverUrl?: string | null;
  /** A direct finance link (vansales-API dealers); config dealers use their Dealski tenant's. */
  financeHref?: string | null;
  isApi?: boolean;
  /** vansales-API dealers' profile extras. */
  photos?: string[];
  specialisms?: string[];
  what3words?: string | null;
  directionsUrl?: string | null;
  reviews?: { author: string; rating: number; text: string; time: string | null }[];
};

const SPECIALISM_LABELS: Record<string, string> = {
  panel_van: "Panel vans", crew_cab: "Crew cabs", luton: "Lutons", tipper: "Tippers", dropside: "Dropsides", chassis_cab: "Chassis cabs", pickup: "Pickups", pickups: "Pickups",
  minibus: "Minibuses", campervan: "Campervans", other: "Other", electric: "Electric", conversions: "Conversions",
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex" role="img" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => <IconStar key={i} width={14} height={14} aria-hidden className={i < Math.round(rating) ? "text-amber-400" : "text-ink-300"} />)}
    </span>
  );
}

function apiToProfile(d: ApiDealer): ProfileDealer {
  const hours = Object.fromEntries(DAYS.map((k) => [k, d.opening_hours?.[k] ?? null])) as Hours;
  let host = "";
  try { host = d.website_url ? new URL(d.website_url).host.replace(/^www\./, "") : ""; } catch { /* not a URL */ }
  return {
    name: d.name,
    slug: d.slug,
    dealskiTenant: "",
    location: { line1: d.address ?? "", town: d.town ?? "", county: d.county ?? "", postcode: d.postcode ?? "" },
    phone: d.phone ?? "",
    whatsapp: null,   // gated contact: the API no longer publishes a WhatsApp number; buyers reach a dealer through a listing's Contact buttons
    featured: false,
    websites: d.website_url && host ? [{ label: host, url: d.website_url }] : [],
    hours,
    about: d.about?.trim() || `${d.name} is a van dealer${d.town ? ` in ${d.town}` : ""}. Browse their stock below.`,
    services: [],
    sellerNames: [d.name],
    googleRating: d.google_rating ?? null,
    googleReviewCount: d.google_review_count ?? null,
    socials: {
      facebook: d.social?.facebook ?? undefined, instagram: d.social?.instagram ?? undefined, linkedin: d.social?.linkedin ?? undefined,
      youtube: d.social?.youtube ?? undefined, twitter: d.social?.twitter ?? undefined,
    },
    googleReviewsUrl: d.google_reviews_url ?? undefined,
    logoUrl: d.logo_url,
    coverUrl: d.cover_url ?? null,
    financeHref: d.finance_url,
    isApi: true,
    photos: (d.photos ?? []).map((p) => p.url).filter(Boolean),
    specialisms: (d.specialisms ?? []).filter((k) => SPECIALISM_LABELS[k]),
    what3words: d.what3words ?? null,
    directionsUrl: d.google_maps_url ?? null,
    reviews: (d.google_reviews ?? []).slice(0, 3),
  };
}

export default async function DealerPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const dealer = getDealerConfig(slug);

  // Not a configured dealer: try the vansales API (dealer portal), then the database. Only an API 404 (and no database row) is a 404; an API outage with nothing else to show
  // throws instead, so the page is not cached as a miss and any previously rendered copy keeps being served.
  const apiResult = dealer ? null : await fetchApiDealerProfile(slug);
  // A configured dealer (Swiss Vans) also exists in the vansales API: take its logo from there (a failure just means initials).
  const configApi = dealer ? await fetchApiDealerProfile(slug).catch(() => null) : null;
  const configLogo = configApi?.kind === "ok" ? configApi.dealer.logo_url : null;
  const apiDealer = apiResult?.kind === "ok" ? apiResult.dealer : null;
  const dbDealer = dealer || apiDealer
    ? null
    : await safeDb("dealer lookup", () => prisma.dealer.findUnique({ where: { slug } }), null);

  if (!dealer && !apiDealer && !dbDealer) {
    if (apiResult?.kind === "error") throw new Error(`Dealer API unavailable for ${slug}`);
    notFound();
  }

  // For API / DB-only dealers, build a config-compatible shape.
  const effectiveDealer: ProfileDealer = dealer
    ? {
        ...dealer, financeHref: dealer.dealskiTenant ? financeUrl(dealer.dealskiTenant) : null, logoUrl: configLogo,
        // A configured dealer (Swiss Vans) also has a vansales-API record: its Google rating and latest reviews (connected in the dealer portal / by the ops workflow) show here too.
        ...(configApi?.kind === "ok" && configApi.dealer.google_rating != null && configApi.dealer.google_review_count != null
          ? { googleRating: configApi.dealer.google_rating, googleReviewCount: configApi.dealer.google_review_count, reviews: (configApi.dealer.google_reviews ?? []).slice(0, 3) }
          : {}),
      }
    : apiDealer
      ? apiToProfile(apiDealer)
      : {
          name: dbDealer!.name,
          slug: dbDealer!.slug,
          dealskiTenant: "",
          location: {
            line1: dbDealer!.location ?? "",
            town: (dbDealer!.location ?? "").split(",")[0].trim(),
            county: "",
            postcode: "",
          },
          phone: dbDealer!.phone ?? "",
          whatsapp: null,
          featured: false,
          websites: [],
          hours: { mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null },
          about: `Welcome to ${dbDealer!.name}.`,
          services: [],
          sellerNames: [dbDealer!.name],
          googleRating: dbDealer!.googleRating,
          googleReviewCount: null,
        };
  const hasHours = Object.values(effectiveDealer.hours).some(Boolean);
  // "Value your van": only for a dealer whose API record says px_enabled (a configured dealer such as Swiss Vans has one too). Off on an older API.
  const pxEnabled = (apiDealer ?? (configApi?.kind === "ok" ? configApi.dealer : null))?.px_enabled === true;

  // Fetch stock for this specific dealer, filtered by their seller names.
  let listings: import("@/lib/listings/types").Listing[] = [];
  if (dealer) {
    const result = await getListings({ sort: "newest" });
    // Stock is the dealer's adverts from the vansales API (dealer_contact.slug); the seller-name match is kept for native/demo rows.
    const bySellerName = result.listings.filter(
      (l) =>
        l.dealer_contact?.slug === slug ||
        effectiveDealer.sellerNames.some((n) => n.toLowerCase() === l.seller.name.toLowerCase()),
    );
    if (dealer.dealskiTenant) {
      // The database is optional for a configured dealer: if it is down, the dealer page still renders from the feed.
      const nativeListings = await safeDb(
        "dealer native listings",
        async () => {
          const rec = await prisma.dealer.findUnique({ where: { slug } });
          return rec ? await fetchNativeDbListings(rec.id) : [];
        },
        [] as import("@/lib/listings/types").Listing[],
      );
      listings = [...nativeListings, ...bySellerName];
    } else {
      listings = bySellerName;
    }
  } else if (apiDealer) {
    // The catalogue already carries every active advert of this dealer (60 s cache); the profile's newest-24 is the fallback if that feed is down.
    const all = await getListings({ sort: "newest" }).catch(() => null);
    const mine = all?.listings.filter((l) => l.dealer_contact?.slug === slug) ?? [];
    listings = mine.length > 0 ? mine : (apiResult as { listings: import("@/lib/listings/types").Listing[] }).listings;
  } else if (dbDealer) {
    listings = await safeDb("dealer native listings", () => fetchNativeDbListings(dbDealer.id), [] as import("@/lib/listings/types").Listing[]);
  }

  // Resolve map coordinates from the feed (config dealers) or DB record (DB dealers).
  // No static fallback — if null, the map component shows address text only.
  let mapLat: number | null = null;
  let mapLng: number | null = null;
  if (dealer) {
    // The pin set on the vansales API's dealer record wins (admin-editable); then the configured address pin (the stock feed's coordinates can be a different site); then the feed; then a postcode geocode.
    if (configApi?.kind === "ok" && configApi.dealer.latitude != null && configApi.dealer.longitude != null) {
      mapLat = configApi.dealer.latitude;
      mapLng = configApi.dealer.longitude;
    } else if (dealer.coords) {
      mapLat = dealer.coords.lat;
      mapLng = dealer.coords.lng;
    }
    const coordSource = listings.find((l) => l.location.lat != null && l.location.lng != null);
    mapLat ??= coordSource?.location.lat ?? null;
    mapLng ??= coordSource?.location.lng ?? null;
    if (mapLat == null || mapLng == null) {
      const g = await safeDb("dealer geocode", () => geocodeTown(`${effectiveDealer.location.postcode || effectiveDealer.location.town}`), null, 4000);
      if (g) { mapLat = g.lat; mapLng = g.lng; }
    }
  } else if (apiDealer) {
    if (apiDealer.latitude != null && apiDealer.longitude != null) {
      mapLat = apiDealer.latitude;
      mapLng = apiDealer.longitude;
    } else {
      const g = await safeDb("dealer geocode", () => geocodeTown(effectiveDealer.location.postcode || effectiveDealer.location.town || effectiveDealer.name), null, 4000);
      if (g) { mapLat = g.lat; mapLng = g.lng; }
    }
  } else if (dbDealer) {
    if (dbDealer.lat != null && dbDealer.lng != null) {
      mapLat = dbDealer.lat;
      mapLng = dbDealer.lng;
    } else {
      const townQuery = effectiveDealer.location.town || effectiveDealer.name;
      const geocoded = await safeDb("dealer geocode", () => geocodeTown(townQuery), null, 4000);
      if (geocoded) {
        mapLat = geocoded.lat;
        mapLng = geocoded.lng;
      }
    }
  }
  const mapAddress = [effectiveDealer.location.line1, effectiveDealer.location.town, effectiveDealer.location.postcode]
    .filter(Boolean)
    .join(", ");

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${effectiveDealer.name} ${effectiveDealer.location.postcode}`,
  )}`;
  const waUrl = whatsappUrl(effectiveDealer.whatsapp, `Hi, I found you on Vansales and I'd like to enquire about a van.`);
  const isApi = effectiveDealer.isApi === true;
  const directionsHref = effectiveDealer.directionsUrl || mapsUrl;
  const socialUrls = Object.values(effectiveDealer.socials ?? {}).filter((u): u is string => !!u);

  const dealerLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": absUrl(`/dealer/${slug}`),
    name: effectiveDealer.name,
    url: absUrl(`/dealer/${slug}`),
    telephone: effectiveDealer.phone || undefined,
    ...(effectiveDealer.logoUrl ? { logo: effectiveDealer.logoUrl, image: effectiveDealer.logoUrl } : {}),
    ...(socialUrls.length > 0 ? { sameAs: socialUrls } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: effectiveDealer.location.line1,
      addressLocality: effectiveDealer.location.town,
      addressRegion: effectiveDealer.location.county,
      postalCode: effectiveDealer.location.postcode,
      addressCountry: "GB",
    },
    ...(mapLat != null && mapLng != null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: mapLat,
            longitude: mapLng,
          },
        }
      : {}),
    openingHoursSpecification: (
      Object.entries(effectiveDealer.hours) as [string, { open: string; close: string } | null][]
    )
      .filter(([, h]) => h !== null)
      .map(([day, h]) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${DAY_LABELS[day]}`,
        opens: h!.open,
        closes: h!.close,
      })),
    ...(effectiveDealer.googleRating && effectiveDealer.googleReviewCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: effectiveDealer.googleRating,
            reviewCount: effectiveDealer.googleReviewCount,
          },
        }
      : {}),
  };

  return (
    <>
      <JsonLd data={dealerLd} />

      {/* ── 1. HEADER ─────────────────────────────────────────────── */}
      <div className="relative isolate overflow-hidden border-b border-border bg-ink-900 text-white">
        {effectiveDealer.coverUrl && (
          <>
            <Photo src={effectiveDealer.coverUrl} alt="" sizes="100vw" first className="-z-20 object-cover" />
            <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-900/95 via-ink-900/70 to-ink-900/40" />
          </>
        )}
        <Container className={effectiveDealer.coverUrl ? "py-14 md:py-20" : "py-10 md:py-14"}>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4 md:gap-5">
              <DealerLogo name={effectiveDealer.name} logoUrl={effectiveDealer.logoUrl} size={72} className="md:!size-20" />
            <div className="min-w-0">
              <p className="mb-2 font-mono text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-eyebrow)] text-white/50">
                Van dealer{effectiveDealer.location.town ? ` · ${effectiveDealer.location.town}` : ""}
              </p>
              <h1 className="font-display text-[clamp(2rem,1rem+4vw,3rem)] font-extrabold leading-tight tracking-[-0.03em] text-white">
                {effectiveDealer.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[length:var(--text-sm)] text-white/65">
                <span className="flex items-center gap-1.5">
                  <IconPin width={15} height={15} />
                  {[effectiveDealer.location.line1, effectiveDealer.location.town, effectiveDealer.location.postcode].filter(Boolean).join(", ") || "UK"}
                </span>
                {effectiveDealer.phone && (
                  <span className="flex items-center gap-1.5">
                    <IconPhone width={15} height={15} />
                    <a href={`tel:${effectiveDealer.phone.replace(/[^\d+]/g, "")}`} className="hover:text-white">
                      {effectiveDealer.phone}
                    </a>
                  </span>
                )}
              </div>
            </div>
            </div>

            {/* Quick stats */}
            <div className="flex shrink-0 flex-wrap gap-3">
              {[
                { label: "In stock", value: String(apiDealer ? Math.max(apiDealer.stock_count, listings.length) : listings.length) },
                ...(effectiveDealer.location.town ? [{ label: "Location", value: effectiveDealer.location.town.split(",").pop()?.trim() ?? effectiveDealer.location.town }] : []),
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex flex-col items-center rounded-[var(--radius-md)] border border-white/15 bg-white/6 px-4 py-2.5"
                >
                  <span className="font-display text-[length:var(--text-xl)] font-bold text-white">{value}</span>
                  <span className="font-mono text-[length:var(--text-2xs)] uppercase tracking-[var(--tracking-eyebrow)] text-white/45">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-10 md:py-14">
        <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
          {/* ── LEFT COLUMN ────────────────────────────────────────── */}
          <div className="min-w-0 space-y-14">

            {/* ── 4. ABOUT ──────────────────────────────────────────── */}
            <section>
              <SectionHeading>About {effectiveDealer.name}</SectionHeading>
              <p className="mt-4 max-w-2xl text-[length:var(--text-md)] leading-relaxed text-ink-600">
                {effectiveDealer.about}
              </p>
              {effectiveDealer.specialisms && effectiveDealer.specialisms.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Specialisms">
                  {effectiveDealer.specialisms.map((k) => <li key={k} className="rounded-full border border-border bg-surface-1 px-2.5 py-0.5 text-[length:var(--text-xs)] font-medium text-ink-700">{SPECIALISM_LABELS[k]}</li>)}
                </ul>
              )}
            </section>

            {/* Photos of the premises (vansales-API dealers) */}
            {effectiveDealer.photos && effectiveDealer.photos.length > 0 && (
              <section aria-label="Dealer photos">
                <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] md:mx-0 md:px-0">
                  {effectiveDealer.photos.map((u, i) => (
                    <li key={u} className="w-[78%] shrink-0 snap-start sm:w-[46%] lg:w-[32%]">
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-lg)] border border-border">
                        <Photo src={u} alt={`${effectiveDealer.name} photo ${i + 1}`} sizes="(min-width: 1024px) 32vw, 78vw" className="object-cover" />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Google reviews: only when the dealer has connected theirs and Google returned data */}
            {effectiveDealer.googleRating != null && effectiveDealer.googleReviewCount != null && (
              <section aria-label="Google reviews">
                <SectionHeading>Google reviews</SectionHeading>
                <p className="mt-3 flex items-center gap-2 text-[length:var(--text-sm)] text-ink-600">
                  <span className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">{effectiveDealer.googleRating.toFixed(1)}</span>
                  <Stars rating={effectiveDealer.googleRating} />
                  <span>{effectiveDealer.googleReviewCount} review{effectiveDealer.googleReviewCount === 1 ? "" : "s"} on Google</span>
                </p>
                {effectiveDealer.reviews && effectiveDealer.reviews.length > 0 && (
                  <ul className="mt-4 grid gap-3 md:grid-cols-3">
                    {effectiveDealer.reviews.map((r, i) => (
                      <li key={i} className="rounded-[var(--radius-lg)] border border-border bg-card p-4 text-[length:var(--text-sm)]">
                        <p className="font-semibold text-ink-900">{r.author || "Google user"}</p>
                        <Stars rating={r.rating} />
                        {r.text && <p className="mt-2 line-clamp-6 text-ink-600">{r.text}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {/* ── 5. SERVICES ───────────────────────────────────────── */}
            {effectiveDealer.services.length > 0 && (
              <section>
                <SectionHeading>What we offer</SectionHeading>
                <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {effectiveDealer.services.map((svc) => (
                    <li key={svc} className="flex items-center gap-2.5 text-[length:var(--text-md)] text-ink-700">
                      <IconCheck width={16} height={16} className="shrink-0 text-success-500" />
                      {svc}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* ── 3. MAP ────────────────────────────────────────────── */}
            <section>
              <SectionHeading>Find us</SectionHeading>
              <div className="mt-4 overflow-hidden rounded-[var(--radius-xl)] border border-border">
{mapLat != null && mapLng != null ? (
                  <DealerStockMap
                    lat={mapLat}
                    lng={mapLng}
                    name={effectiveDealer.name}
                    address={mapAddress}
                    stock={listings
                      .filter((l) => l.status !== "sold" && l.location.lat != null && l.location.lng != null)
                      .map((l) => ({ id: l.id, slug: l.slug, title: `${l.make} ${l.model}`, price: l.price, lat: l.location.lat!, lng: l.location.lng! }))}
                  />
                ) : (
                  <p className="grid h-40 place-items-center bg-surface-1 px-6 text-center text-[length:var(--text-sm)] text-ink-500">{mapAddress || "Location coming soon"}</p>
                )}
              </div>
              <div className="mt-3 flex items-start gap-1.5 text-[length:var(--text-sm)] text-ink-500">
                <IconPin width={14} height={14} className="mt-0.5 shrink-0 text-ink-400" />
                <span>
                  {effectiveDealer.location.directions && <span className="block font-medium text-ink-700">{effectiveDealer.location.directions}</span>}
                  {mapAddress}
                  {" · "}
                  <a
                    href={directionsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-700 hover:underline"
                  >
                    {effectiveDealer.directionsUrl ? "Get directions" : "Open in Google Maps"}
                    <IconExternalLink width={12} height={12} className="ml-1 inline-block align-middle" />
                  </a>
                  {effectiveDealer.what3words && (
                    <>
                      {" · "}
                      <a href={`https://what3words.com/${effectiveDealer.what3words.replace(/^\/+/, "")}`} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline">
                        {effectiveDealer.what3words}
                      </a>
                    </>
                  )}
                </span>
              </div>
            </section>

            {/* ── 6. STOCK GRID ─────────────────────────────────────── */}
            {listings.length > 0 && (
              <section>
                <div className="flex items-baseline justify-between gap-4">
                  <SectionHeading>Current stock</SectionHeading>
                  {!isApi && (
                    <Link
                      href={`/vans?dealer=${encodeURIComponent(slug)}`}
                      className="text-[length:var(--text-sm)] font-semibold text-brand-700 hover:underline"
                    >
                      View all
                    </Link>
                  )}
                </div>
                <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {listings.slice(0, isApi ? 24 : 12).map((listing, i) => (
                    <ListingCard key={listing.id} listing={listing} cardIndex={i} priority={i < 3} />
                  ))}
                </div>
                {!isApi && listings.length > 12 && (
                  <div className="mt-6 text-center">
                    <Link
                      href="/vans"
                      className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-border bg-white px-5 py-2.5 text-[length:var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400 hover:bg-surface-1 transition-colors"
                    >
                      See all {listings.length} vans
                    </Link>
                  </div>
                )}
              </section>
            )}
            {listings.length === 0 && (
              <section>
                <SectionHeading>Current stock</SectionHeading>
                <EmptyState
                  illustration="no-vans"
                  title="No vans in stock right now"
                  body="This dealer has nothing listed at the moment. Browse every van in the meantime."
                  action={{ label: "Browse all vans", href: "/vans" }}
                  className="mt-5"
                />
              </section>
            )}
          </div>

          {/* ── RIGHT COLUMN — sticky contact card ─────────────────── */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-[var(--radius-xl)] border border-border bg-card p-5 shadow-[var(--shadow-sm)]">
              <h2 className="font-display text-[length:var(--text-lg)] font-bold text-ink-900">
                Get in touch
              </h2>
              <p className="mt-1 text-[length:var(--text-sm)] text-ink-500">
                {effectiveDealer.name} · {effectiveDealer.location.town}
              </p>

              {/* ── 2. CTA BUTTONS ──────────────────────────────────── */}
              <div className="mt-5">
                {isApi ? (
                  // vansales-API dealers: there is no dealer-level enquiry endpoint (enquiries and call-backs are per advert), so this card offers the dealer's own contact routes.
                  <div className="flex flex-col gap-2">
                    {waUrl && (
                      <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[#25D366] text-[length:var(--text-base)] font-semibold text-white transition-colors hover:bg-[#1ebe5d]">
                        <IconWhatsApp width={18} height={18} aria-hidden />
                        WhatsApp
                      </a>
                    )}
                    {effectiveDealer.phone && (
                      <a href={`tel:${effectiveDealer.phone.replace(/[^\d+]/g, "")}`} className="flex h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border bg-white text-[length:var(--text-base)] font-semibold text-ink-800 transition-colors hover:border-ink-400 hover:bg-surface-1">
                        <IconPhone width={18} height={18} aria-hidden />
                        {effectiveDealer.phone}
                      </a>
                    )}
                    {effectiveDealer.websites[0] && (
                      <a href={effectiveDealer.websites[0].url} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border bg-white text-[length:var(--text-base)] font-semibold text-ink-800 transition-colors hover:border-ink-400 hover:bg-surface-1">
                        <IconGlobe width={18} height={18} aria-hidden />
                        Visit website
                        <IconExternalLink width={13} height={13} aria-hidden />
                      </a>
                    )}
                    {!waUrl && !effectiveDealer.phone && !effectiveDealer.websites[0] && (
                      <p className="text-[length:var(--text-sm)] text-ink-500">Open one of their vans below to send an enquiry.</p>
                    )}
                  </div>
                ) : (
                  <DealerCTAButtons dealer={effectiveDealer} />
                )}
              </div>

              {/* Websites */}
              {!isApi && effectiveDealer.websites.length > 0 && (
                <div className="mt-5 border-t border-border pt-4">
                  <p className="mb-2 text-[length:var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-400">
                    Websites
                  </p>
                  <ul className="space-y-1.5">
                    {effectiveDealer.websites.map((site) => (
                      <li key={site.url}>
                        <a
                          href={site.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[length:var(--text-sm)] text-brand-700 hover:underline"
                        >
                          <IconGlobe width={14} height={14} className="shrink-0" />
                          {site.label}
                          <IconExternalLink width={12} height={12} className="ml-auto shrink-0 text-ink-400" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Social profiles: only the ones that are set */}
              {hasSocials(effectiveDealer.socials) && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="mb-2 text-[length:var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-400">Follow us</p>
                  <SocialLinks socials={effectiveDealer.socials} />
                </div>
              )}

              {/* Google reviews: a link to the dealer's own page, no rating is shown that we do not have */}
              {effectiveDealer.googleReviewsUrl && (
                <div className="mt-4 border-t border-border pt-4">
                  <a href={effectiveDealer.googleReviewsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[length:var(--text-sm)] font-semibold text-brand-700 hover:underline">
                    <IconStar width={14} height={14} className="shrink-0" aria-hidden />
                    Read our Google reviews
                    <IconExternalLink width={12} height={12} className="ml-auto shrink-0 text-ink-400" aria-hidden />
                  </a>
                </div>
              )}

              {/* Hours */}
              {hasHours && (
              <div className="mt-4 border-t border-border pt-4">
                <p className="mb-2 flex items-center gap-1.5 text-[length:var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-400">
                  <IconClock width={13} height={13} />
                  Opening hours
                </p>
                <ul className="space-y-1">
                  {(Object.entries(effectiveDealer.hours) as [string, { open: string; close: string } | null][]).map(
                    ([day, hours]) => (
                      <li key={day} className="flex justify-between text-[length:var(--text-sm)]">
                        <span className="text-ink-600">{DAY_LABELS[day]}</span>
                        <span className={hours ? "font-medium text-ink-800" : "text-ink-400"}>
                          {hours ? `${hours.open} – ${hours.close}` : "Closed"}
                        </span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
              )}

              {/* Finance link */}
              {effectiveDealer.financeHref && (
              <div className="mt-4 border-t border-border pt-4">
                <a
                  href={effectiveDealer.financeHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-brand-500/40 bg-brand-tint py-2.5 text-[length:var(--text-sm)] font-semibold text-brand-700 transition-colors hover:bg-brand-500 hover:text-white"
                >
                  Apply for finance
                  <IconExternalLink width={13} height={13} />
                </a>
              </div>
              )}
            </div>
            {pxEnabled && (
              <ValueYourVan dealerName={effectiveDealer.name} dealskiTenant={effectiveDealer.dealskiTenant} listingHref={listings[0] ? listingPath(listings[0]) : null} />
            )}
          </aside>
        </div>
      </Container>
    </>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-[length:var(--text-2xl)] font-bold text-ink-900">{children}</h2>
  );
}
