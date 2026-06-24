import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDealerConfig, whatsappUrl, financeUrl } from "@/lib/dealers/config";
import { getListings } from "@/lib/listings/client";
import { fetchNativeDbListings } from "@/lib/listings/sources/db";
import { prisma } from "@/lib/prisma";
import { geocodeTown } from "@/lib/geocoding";
import { Container } from "@/components/ui";
import { ListingCard } from "@/components/listing-card";
import { JsonLd } from "@/components/json-ld";
import { DealerCTAButtons } from "@/components/dealer-cta-buttons";
import { DealerMapClient } from "@/components/dealer-map-wrapper";
import {
  IconPin,
  IconClock,
  IconGlobe,
  IconExternalLink,
  IconCheck,
  IconPhone,
} from "@/components/icons";
import { SITE, absUrl } from "@/lib/site";

export const revalidate = 3600;

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const dealer = getDealerConfig(slug);
  if (dealer) {
    const title = `${dealer.name} — Van Dealer in ${dealer.location.town}`;
    const description = `${dealer.name} is a van dealer in ${dealer.location.town}, ${dealer.location.county}. Browse their stock on ${SITE.name}.`;
    return { title, description, alternates: { canonical: `/dealer/${slug}` }, openGraph: { title, description, url: `/dealer/${slug}`, type: "website" } };
  }
  const dbDealer = await prisma.dealer.findUnique({ where: { slug } });
  if (!dbDealer) return { title: "Dealer not found" };
  const town = (dbDealer.location ?? "").split(",")[0].trim() || "UK";
  const title = `${dbDealer.name} — Van Dealer${town ? ` in ${town}` : ""}`;
  const description = `Browse ${dbDealer.name}'s stock on ${SITE.name}.`;
  return { title, description, alternates: { canonical: `/dealer/${slug}` }, openGraph: { title, description, url: `/dealer/${slug}`, type: "website" } };
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

export default async function DealerPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const dealer = getDealerConfig(slug);

  // If not in static config, fall back to DB dealer record.
  const dbDealer = dealer
    ? null
    : await prisma.dealer.findUnique({ where: { slug } });

  if (!dealer && !dbDealer) notFound();

  // For DB-only dealers, build a minimal config-compatible shape.
  const effectiveDealer = dealer ?? {
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

  // Fetch stock for this specific dealer, filtered by their seller names.
  let listings: import("@/lib/listings/types").Listing[] = [];
  if (dealer) {
    const result = await getListings({ sort: "newest" });
    const bySellerName = result.listings.filter((l) =>
      effectiveDealer.sellerNames.some((n) => n.toLowerCase() === l.seller.name.toLowerCase()),
    );
    if (dealer.dealskiTenant) {
      const dealerDbRecord = await prisma.dealer.findUnique({ where: { slug } });
      const nativeListings = dealerDbRecord ? await fetchNativeDbListings(dealerDbRecord.id) : [];
      listings = [...nativeListings, ...bySellerName];
    } else {
      listings = bySellerName;
    }
  } else if (dbDealer) {
    listings = await fetchNativeDbListings(dbDealer.id);
  }

  // Resolve map coordinates from the feed (config dealers) or DB record (DB dealers).
  // No static fallback — if null, the map component shows address text only.
  let mapLat: number | null = null;
  let mapLng: number | null = null;
  if (dealer) {
    const coordSource = listings.find((l) => l.location.lat != null && l.location.lng != null);
    mapLat = coordSource?.location.lat ?? null;
    mapLng = coordSource?.location.lng ?? null;
  } else if (dbDealer) {
    if (dbDealer.lat != null && dbDealer.lng != null) {
      mapLat = dbDealer.lat;
      mapLng = dbDealer.lng;
    } else {
      const townQuery = effectiveDealer.location.town || effectiveDealer.name;
      const geocoded = await geocodeTown(townQuery);
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

  const dealerLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": absUrl(`/dealer/${slug}`),
    name: effectiveDealer.name,
    url: absUrl(`/dealer/${slug}`),
    telephone: effectiveDealer.phone,
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
    ...(effectiveDealer.googleRating
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
      <div className="border-b border-border bg-ink-900 text-white">
        <Container className="py-10 md:py-14">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 font-mono text-[var(--text-xs)] uppercase tracking-[var(--tracking-eyebrow)] text-white/50">
                Van dealer · {effectiveDealer.location.town}
              </p>
              <h1 className="font-display text-[clamp(2rem,1rem+4vw,3rem)] font-extrabold leading-tight tracking-[-0.03em] text-white">
                {effectiveDealer.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[var(--text-sm)] text-white/65">
                <span className="flex items-center gap-1.5">
                  <IconPin width={15} height={15} />
                  {effectiveDealer.location.line1}, {effectiveDealer.location.town}, {effectiveDealer.location.postcode}
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

            {/* Quick stats */}
            <div className="flex shrink-0 flex-wrap gap-3">
              {[
                { label: "In stock", value: String(listings.length) },
                { label: "Location", value: effectiveDealer.location.town.split(",").pop()?.trim() ?? effectiveDealer.location.town },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex flex-col items-center rounded-[var(--radius-md)] border border-white/15 bg-white/6 px-4 py-2.5"
                >
                  <span className="font-display text-[var(--text-xl)] font-bold text-white">{value}</span>
                  <span className="font-mono text-[var(--text-2xs)] uppercase tracking-[var(--tracking-eyebrow)] text-white/45">
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
              <p className="mt-4 max-w-2xl text-[var(--text-md)] leading-relaxed text-ink-600">
                {effectiveDealer.about}
              </p>
            </section>

            {/* ── 5. SERVICES ───────────────────────────────────────── */}
            {effectiveDealer.services.length > 0 && (
              <section>
                <SectionHeading>What we offer</SectionHeading>
                <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {effectiveDealer.services.map((svc) => (
                    <li key={svc} className="flex items-center gap-2.5 text-[var(--text-md)] text-ink-700">
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
                <DealerMapClient
                  lat={mapLat}
                  lng={mapLng}
                  name={effectiveDealer.name}
                  address={mapAddress}
                />
              </div>
              <div className="mt-3 flex items-start gap-1.5 text-[var(--text-sm)] text-ink-500">
                <IconPin width={14} height={14} className="mt-0.5 shrink-0 text-ink-400" />
                <span>
                  {mapAddress}
                  {" · "}
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-700 hover:underline"
                  >
                    Open in Google Maps
                    <IconExternalLink width={12} height={12} className="ml-1 inline-block align-middle" />
                  </a>
                </span>
              </div>
            </section>

            {/* ── 6. STOCK GRID ─────────────────────────────────────── */}
            {listings.length > 0 && (
              <section>
                <div className="flex items-baseline justify-between gap-4">
                  <SectionHeading>Current stock</SectionHeading>
                  <Link
                    href="/vans"
                    className="text-[var(--text-sm)] font-semibold text-brand-700 hover:underline"
                  >
                    View all
                  </Link>
                </div>
                <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {listings.slice(0, 12).map((listing, i) => (
                    <ListingCard key={listing.id} listing={listing} cardIndex={i} priority={i < 3} />
                  ))}
                </div>
                {listings.length > 12 && (
                  <div className="mt-6 text-center">
                    <Link
                      href="/vans"
                      className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-border bg-white px-5 py-2.5 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400 hover:bg-surface-1 transition-colors"
                    >
                      See all {listings.length} vans
                    </Link>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* ── RIGHT COLUMN — sticky contact card ─────────────────── */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-[var(--radius-xl)] border border-border bg-card p-5 shadow-[var(--shadow-sm)]">
              <h2 className="font-display text-[var(--text-lg)] font-bold text-ink-900">
                Get in touch
              </h2>
              <p className="mt-1 text-[var(--text-sm)] text-ink-500">
                {effectiveDealer.name} · {effectiveDealer.location.town}
              </p>

              {/* ── 2. CTA BUTTONS ──────────────────────────────────── */}
              <div className="mt-5">
                <DealerCTAButtons dealer={effectiveDealer} />
              </div>

              {/* Websites */}
              {effectiveDealer.websites.length > 0 && (
                <div className="mt-5 border-t border-border pt-4">
                  <p className="mb-2 text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-400">
                    Websites
                  </p>
                  <ul className="space-y-1.5">
                    {effectiveDealer.websites.map((site) => (
                      <li key={site.url}>
                        <a
                          href={site.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[var(--text-sm)] text-brand-700 hover:underline"
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

              {/* Hours */}
              <div className="mt-4 border-t border-border pt-4">
                <p className="mb-2 flex items-center gap-1.5 text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-400">
                  <IconClock width={13} height={13} />
                  Opening hours
                </p>
                <ul className="space-y-1">
                  {(Object.entries(effectiveDealer.hours) as [string, { open: string; close: string } | null][]).map(
                    ([day, hours]) => (
                      <li key={day} className="flex justify-between text-[var(--text-sm)]">
                        <span className="text-ink-600">{DAY_LABELS[day]}</span>
                        <span className={hours ? "font-medium text-ink-800" : "text-ink-400"}>
                          {hours ? `${hours.open} – ${hours.close}` : "Closed"}
                        </span>
                      </li>
                    ),
                  )}
                </ul>
              </div>

              {/* Finance link */}
              <div className="mt-4 border-t border-border pt-4">
                {effectiveDealer.dealskiTenant && (
                <a
                  href={financeUrl(effectiveDealer.dealskiTenant)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-brand-500/40 bg-brand-tint py-2.5 text-[var(--text-sm)] font-semibold text-brand-700 transition-colors hover:bg-brand-500 hover:text-white"
                >
                  Apply for finance
                  <IconExternalLink width={13} height={13} />
                </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-[var(--text-2xl)] font-bold text-ink-900">{children}</h2>
  );
}
