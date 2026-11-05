import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Eyebrow, Price, PlateBadge, StatusBadge, Badge } from "@/components/ui";
import { Gallery } from "@/components/gallery";
import { SpecTable } from "@/components/spec-table";
import { EnquiryPanel } from "@/components/enquiry-panel";
import { SaveButton } from "@/components/save-button";
import { SpecReadout } from "@/components/spec-readout";
import { HpiCard } from "@/components/hpi-card";
import { JsonLd } from "@/components/json-ld";
import { CONDITION_LABEL, detailRows, VAT_BADGE, warrantyText } from "@/lib/listings/vanDetails";
import { IconGauge, IconFuel, IconGearbox, IconRuler, IconCheck, IconShield } from "@/components/icons";
import { ListingActions } from "@/components/listing-actions";
import { listingActionLinks } from "@/lib/dealers/actions";
import { getListingBySlug } from "@/lib/listings/client";
import { getDealerConfigBySeller } from "@/lib/dealers/config";
import type { Listing } from "@/lib/listings/types";
import {
  listingTitle,
  formatPrice,
  formatMileage,
  formatMileageDisplay,
  titleCase,
  WHEELBASE_SHORT,
} from "@/lib/listings/format";
import { modelPath } from "@/lib/listings/slug";
import { SITE, absUrl } from "@/lib/site";

type Params = { slug: string };
// ISR: one render per slug per minute, shared by every visitor. (It used to read ?enquire=1 through searchParams, which forces a fresh render on EVERY request; the panel
// now reads that from the URL in the browser.) Unknown slugs render on demand and are cached the same way.
export const revalidate = 60;
export async function generateStaticParams() {
  return [];
}

/** Best available per-vehicle photo URL for a listing. */
function listingImageUrl(listing: Listing): string | null {
  return listing.images.find((i) => i.url.startsWith("http"))?.url ?? null;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const { listing } = await getListingBySlug(slug);
  if (!listing) return { title: "Van not found" };
  const title = `${listingTitle(listing)}${listing.year > 0 ? ` (${listing.year})` : ""}`;
  const description = `${title} for sale in ${listing.location.town} — ${formatPrice(listing.price)}. ${formatMileage(
    listing.mileage,
  )}, ${titleCase(listing.fuel)}, ${titleCase(listing.transmission)}. ${listing.van_spec.body_style} on ${SITE.name}.`;
  const canonical = `/listing/${slug}`;
  const ogImage = absUrl(`/api/og/${slug}`);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} · ${SITE.name}`,
      description,
      url: canonical,
      type: "website",
      // Per-listing share card: the van's photo with price and name overlaid (app/api/og/[slug]); it falls back to a branded card.
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title: `${title} · ${SITE.name}`, description, images: [{ url: ogImage, alt: title }] },
  };
}

const formatMotDate = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export default async function ListingPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const { listing } = await getListingBySlug(slug);
  if (!listing) notFound();

  const dealerConfig = listing.dealer_contact ? null : getDealerConfigBySeller(listing.seller.name);
  const actionLinks = listingActionLinks(listing, dealerConfig);
  const hasExtraActions = !!(actionLinks.whatsapp || actionLinks.call || actionLinks.financeHref || actionLinks.bookCall);
  const displayTown = dealerConfig?.location.town ?? listing.location.town;
  const title = listingTitle(listing);
  const ogImage = listingImageUrl(listing);
  const specRows = detailRows(listing.details);
  const readouts = [
    { icon: <IconGauge />, label: "Mileage", value: formatMileageDisplay(listing.mileage, listing.condition) },
    { icon: <IconGearbox />, label: "Gearbox", value: titleCase(listing.transmission) },
    { icon: <IconFuel />, label: "Fuel", value: titleCase(listing.fuel) },
    {
      icon: <IconRuler />,
      label: "Wheelbase",
      value: listing.van_spec.wheelbase ? WHEELBASE_SHORT[listing.van_spec.wheelbase] : "—",
    },
  ];

  const vehicleLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: title,
    vehicleConfiguration: listing.derivative || undefined,
    brand: { "@type": "Brand", name: listing.make },
    model: listing.model,
    ...(listing.year > 0 ? { vehicleModelDate: String(listing.year) } : {}),
    bodyType: listing.van_spec.body_style,
    color: listing.colour !== "—" ? listing.colour : undefined,
    fuelType: listing.fuel,
    vehicleTransmission: listing.transmission,
    ...(listing.mileage != null
      ? { mileageFromOdometer: { "@type": "QuantitativeValue", value: listing.mileage, unitCode: "SMI" } }
      : {}),
    ...(listing.engine_cc
      ? { vehicleEngine: { "@type": "EngineSpecification", engineDisplacement: { "@type": "QuantitativeValue", value: listing.engine_cc, unitCode: "CMQ" } } }
      : {}),
  };

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    description: listing.description,
    category: `${listing.van_spec.body_style} van`,
    brand: { "@type": "Brand", name: listing.make },
    ...(ogImage ? { image: absUrl(ogImage) } : {}),
    offers: {
      "@type": "Offer",
      url: absUrl(`/listing/${slug}`),
      priceCurrency: "GBP",
      ...(listing.price != null ? { price: listing.price } : {}),
      availability:
        listing.status === "active"
          ? "https://schema.org/InStock"
          : listing.status === "reserved"
            ? "https://schema.org/LimitedAvailability"
            : "https://schema.org/SoldOut",
      itemCondition:
        listing.condition === "new"
          ? "https://schema.org/NewCondition"
          : "https://schema.org/UsedCondition",
      seller: {
        "@type": listing.seller_type === "dealer" ? "AutoDealer" : "Person",
        name: listing.seller_type === "private" ? "Private seller" : listing.seller.name,
      },
    },
  };

  return (
    <>
      <JsonLd data={[vehicleLd, productLd]} />

      <Container className="py-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[length:var(--text-sm)] text-ink-500">
          <Link href="/" className="hover:text-ink-800">Home</Link>
          <span aria-hidden>/</span>
          <Link href={modelPath(listing.make, listing.model)} className="hover:text-ink-800">
            {listing.make} {listing.model}
          </Link>
          <span aria-hidden>/</span>
          <span className="truncate font-medium text-ink-700">{title}</span>
        </nav>

        {/* Single page header band (one H1 for the page) */}
        <div className="mt-5">
          <ListingHeader listing={listing} title={title} displayTown={displayTown} />
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left: gallery + spec */}
          <div className="min-w-0">
            <Gallery listing={listing} />

            {/* Video: the seller's own walk-around takes priority over the generated Showroom Cut (made from their photos, no AI); the 9:16 cut belongs to the generated one */}
            {(listing.seller_video_url ?? listing.video_url) && (
              <section className="mt-6" aria-label={listing.seller_video_url ? "Walk-around video from the seller" : "Video of this van"}>
                <video src={(listing.seller_video_url ?? listing.video_url) as string} controls playsInline preload="metadata" className="w-full rounded-[var(--radius-lg)] bg-black" />
                {!listing.seller_video_url && listing.video_vertical_url && (
                  <p className="mt-2 text-[length:var(--text-sm)] text-ink-500">
                    <a href={listing.video_vertical_url} download className="underline hover:text-ink-800">Download the vertical version</a> for stories and reels.
                  </p>
                )}
              </section>
            )}

            {/* The seller's YouTube video, after their own upload (privacy-friendly embed, lazy loaded) */}
            {listing.youtube_embed_url && (
              <section className="mt-6" aria-label="Video on YouTube">
                <iframe src={listing.youtube_embed_url.replace("www.youtube.com", "www.youtube-nocookie.com")} title={`${title} on YouTube`} loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="aspect-video w-full rounded-[var(--radius-lg)] bg-black" />
              </section>
            )}

            <div className="mt-6 rounded-[var(--radius-lg)] border border-border bg-card">
              <SpecReadout items={readouts} className="px-2" />
            </div>

            {/* Specification the seller filled in (private adverts): only the rows they gave */}
            {specRows.length > 0 && (
              <section className="mt-6" aria-label="Specification">
                <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">Specification</h2>
                <dl className="mt-3 divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-card">
                  {specRows.map((r) => (
                    <div key={r.label} className="flex items-baseline justify-between gap-4 px-4 py-2.5">
                      <dt className="text-[length:var(--text-sm)] text-ink-500">{r.label}</dt>
                      <dd className="text-right font-medium text-ink-900">{r.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {/* Warranty, as the seller described it */}
            {warrantyText(listing.warranty_type, listing.warranty_expiry) && (
              <p className="mt-4 rounded-[var(--radius-lg)] border border-border bg-card px-4 py-3 text-[length:var(--text-md)] text-ink-800">
                <span className="font-medium">{warrantyText(listing.warranty_type, listing.warranty_expiry)}</span>
              </p>
            )}

            {/* Features & extras the seller ticked */}
            {listing.extras && listing.extras.length > 0 && (
              <section className="mt-6" aria-label="Features and extras">
                <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">Features &amp; extras</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {listing.extras.map((f) => (
                    <li key={f.slug}><Badge tone="neutral"><IconCheck width={12} height={12} aria-hidden />{f.label}</Badge></li>
                  ))}
                </ul>
              </section>
            )}

            {/* MOT facts from the DVLA / DVSA records (private adverts) */}
            {(listing.mot_expiry || listing.last_mot_mileage != null) && (
              <section className="mt-6 rounded-[var(--radius-lg)] border border-border bg-card px-4 py-3" aria-label="MOT">
                <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                  {listing.mot_expiry && (
                    <div>
                      <dt className="text-[length:var(--text-sm)] text-ink-500">MOT expiry</dt>
                      <dd className="font-medium text-ink-900">{formatMotDate(listing.mot_expiry)}</dd>
                    </div>
                  )}
                  {listing.last_mot_mileage != null && (
                    <div>
                      <dt className="text-[length:var(--text-sm)] text-ink-500">Last MOT mileage</dt>
                      <dd className="font-medium text-ink-900">
                        {listing.last_mot_mileage.toLocaleString("en-GB")} miles
                        {listing.last_mot_date ? <span className="font-normal text-ink-500"> · {formatMotDate(listing.last_mot_date)}</span> : null}
                      </dd>
                    </div>
                  )}
                </dl>
                <p className="mt-2 text-[length:var(--text-xs,12px)] text-ink-500">From DVLA and DVSA records.</p>
              </section>
            )}

            {/* Vehicle history check: the full findings when the API publishes them (replaces the plain badge); otherwise the header badge stays. */}
            {listing.hpi_check && <HpiCard result={listing.hpi_check} />}

            {/* Description */}
            <section className="mt-8">
              <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">Description</h2>
              <p className="mt-3 max-w-2xl whitespace-pre-line text-[length:var(--text-md)] leading-relaxed text-ink-600">
                {listing.description}
              </p>
            </section>

            {/* Features */}
            {listing.features.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">
                  Specification &amp; features
                </h2>
                <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                  {listing.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[length:var(--text-md)] text-ink-700">
                      <IconCheck width={16} height={16} className="shrink-0 text-success-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Full spec table */}
            <section className="mt-10">
              <h2 className="mb-4 font-display text-[length:var(--text-xl)] font-bold text-ink-900">Full specification</h2>
              <SpecTable listing={listing} />
            </section>
          </div>

          {/* Right: sticky enquiry */}
          <aside className="lg:sticky lg:top-20 lg:self-start space-y-3">
            {/* Button row: Enquire + whatever this dealer offers (WhatsApp, finance, book a call). Private sellers have the form below and nothing else. */}
            {hasExtraActions && <ListingActions links={actionLinks} sold={listing.status === "sold"} />}
            <EnquiryPanel listing={listing} />
          </aside>
        </div>
      </Container>
    </>
  );
}

function ListingHeader({ listing, title, displayTown }: { listing: Listing; title: string; displayTown: string }) {
  return (
    <div>
      <Eyebrow>{listing.van_spec.body_style}</Eyebrow>
      <div className="mt-2 flex items-start justify-between gap-3">
        <h1 className="font-display text-[length:var(--text-3xl)] font-extrabold leading-tight text-ink-900">{title}</h1>
        <div className="flex shrink-0 items-center gap-2">
          {listing.source === "vansales" && <SaveButton id={listing.source_id} label />}
          {listing.year > 0 && <PlateBadge text={listing.plate || String(listing.year)} size="md" />}
        </div>
      </div>
      <p className="mt-1.5 text-[length:var(--text-sm)] text-ink-500">
        {listing.year > 0 ? `${listing.year} · ` : ""}
        {displayTown}
        {listing.colour !== "—" ? ` · ${listing.colour}` : ""}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Price listing={listing} size="lg" />
        <StatusBadge status={listing.status} />
        {(listing.vat_status === "vat_qualifying" || listing.vat_status === "ex_vat") && <Badge tone="neutral">{VAT_BADGE[listing.vat_status]}</Badge>}
        {listing.hpi_checked && !listing.hpi_check && (
          <span title={listing.hpi_checked_at ? `Vehicle history checked on ${formatMotDate(listing.hpi_checked_at)}: clear` : "Vehicle history checked"}>
            <Badge tone="success"><IconShield width={12} height={12} aria-hidden />HPI checked</Badge>
          </span>
        )}
        {listing.ulez_compliant === true && <Badge tone="brand">ULEZ compliant</Badge>}
        {listing.ulez_compliant === false && <Badge tone="warning">Not ULEZ compliant</Badge>}
        {listing.ulez_compliant == null && listing.ulez && <Badge tone="brand">ULEZ ready</Badge>}
        {listing.vehicle_condition && <Badge tone="neutral">{CONDITION_LABEL[listing.vehicle_condition]}</Badge>}
        {listing.v5_present === true && <Badge tone="success">V5 present</Badge>}
        {listing.price_type === "no_vat" && <Badge tone="neutral">No VAT</Badge>}
      </div>
    </div>
  );
}
