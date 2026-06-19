import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDealerConfig, whatsappUrl, financeUrl } from "@/lib/dealers/config";
import { getListings } from "@/lib/listings/client";
import { Container } from "@/components/ui";
import { ListingCard } from "@/components/listing-card";
import { JsonLd } from "@/components/json-ld";
import { DealerCTAButtons } from "@/components/dealer-cta-buttons";
import {
  IconPin,
  IconClock,
  IconGlobe,
  IconExternalLink,
  IconCheck,
  IconPhone,
} from "@/components/icons";
import { SITE, absUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const dealer = getDealerConfig(slug);
  if (!dealer) return { title: "Dealer not found" };
  const title = `${dealer.name} — Van Dealer in ${dealer.location.town}`;
  const description = `${dealer.name} is a van dealer in ${dealer.location.town}, ${dealer.location.county}. Browse their stock on ${SITE.name}.`;
  return {
    title,
    description,
    alternates: { canonical: `/dealer/${slug}` },
    openGraph: { title, description, url: `/dealer/${slug}`, type: "website" },
  };
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
  if (!dealer) notFound();

  const { listings } = await getListings({ pageSize: 24, sort: "newest" });

  const mapSrc = `https://maps.google.com/maps?q=${dealer.location.lat},${dealer.location.lng}&z=15&output=embed`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${dealer.name} ${dealer.location.postcode}`,
  )}`;
  const waUrl = whatsappUrl(dealer.whatsapp, `Hi, I found you on Vansales and I'd like to enquire about a van.`);

  const dealerLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": absUrl(`/dealer/${slug}`),
    name: dealer.name,
    url: absUrl(`/dealer/${slug}`),
    telephone: dealer.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: dealer.location.line1,
      addressLocality: dealer.location.town,
      addressRegion: dealer.location.county,
      postalCode: dealer.location.postcode,
      addressCountry: "GB",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: dealer.location.lat,
      longitude: dealer.location.lng,
    },
    openingHoursSpecification: (
      Object.entries(dealer.hours) as [string, { open: string; close: string } | null][]
    )
      .filter(([, h]) => h !== null)
      .map(([day, h]) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${DAY_LABELS[day]}`,
        opens: h!.open,
        closes: h!.close,
      })),
    ...(dealer.googleRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: dealer.googleRating,
            reviewCount: dealer.googleReviewCount,
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
                Van dealer · {dealer.location.town}
              </p>
              <h1 className="font-display text-[clamp(2rem,1rem+4vw,3rem)] font-extrabold leading-tight tracking-[-0.03em] text-white">
                {dealer.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[var(--text-sm)] text-white/65">
                <span className="flex items-center gap-1.5">
                  <IconPin width={15} height={15} />
                  {dealer.location.line1}, {dealer.location.town}, {dealer.location.postcode}
                </span>
                <span className="flex items-center gap-1.5">
                  <IconPhone width={15} height={15} />
                  <a href={`tel:${dealer.phone.replace(/[^\d+]/g, "")}`} className="hover:text-white">
                    {dealer.phone}
                  </a>
                </span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex shrink-0 flex-wrap gap-3">
              {[
                { label: "In stock", value: String(listings.length) },
                { label: "Experience", value: "20+ yrs" },
                { label: "Location", value: "Bridgend" },
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
              <SectionHeading>About {dealer.name}</SectionHeading>
              <p className="mt-4 max-w-2xl text-[var(--text-md)] leading-relaxed text-ink-600">
                {dealer.about}
              </p>
            </section>

            {/* ── 5. SERVICES ───────────────────────────────────────── */}
            <section>
              <SectionHeading>What we offer</SectionHeading>
              <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {dealer.services.map((svc) => (
                  <li key={svc} className="flex items-center gap-2.5 text-[var(--text-md)] text-ink-700">
                    <IconCheck width={16} height={16} className="shrink-0 text-success-500" />
                    {svc}
                  </li>
                ))}
              </ul>
            </section>

            {/* ── 3. GOOGLE MAP ─────────────────────────────────────── */}
            <section>
              <SectionHeading>Find us</SectionHeading>
              <div className="mt-4 overflow-hidden rounded-[var(--radius-xl)] border border-border">
                <iframe
                  src={mapSrc}
                  width="100%"
                  height="340"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Map showing ${dealer.name} in ${dealer.location.town}`}
                />
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-[var(--text-sm)] text-brand-700 hover:underline"
              >
                Open in Google Maps
                <IconExternalLink width={13} height={13} />
              </a>
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
                {dealer.name} · {dealer.location.town}
              </p>

              {/* ── 2. CTA BUTTONS ──────────────────────────────────── */}
              <div className="mt-5">
                <DealerCTAButtons dealer={dealer} />
              </div>

              {/* Websites */}
              {dealer.websites.length > 0 && (
                <div className="mt-5 border-t border-border pt-4">
                  <p className="mb-2 text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-400">
                    Websites
                  </p>
                  <ul className="space-y-1.5">
                    {dealer.websites.map((site) => (
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
                  {(Object.entries(dealer.hours) as [string, { open: string; close: string } | null][]).map(
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
                <a
                  href={financeUrl(dealer.dealskiTenant)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-brand-500/40 bg-brand-tint py-2.5 text-[var(--text-sm)] font-semibold text-brand-700 transition-colors hover:bg-brand-500 hover:text-white"
                >
                  Apply for finance
                  <IconExternalLink width={13} height={13} />
                </a>
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
