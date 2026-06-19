import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Eyebrow, Price, PlateBadge, StatusBadge, Badge } from "@/components/ui";
import { Gallery } from "@/components/gallery";
import { SpecTable } from "@/components/spec-table";
import { EnquiryPanel } from "@/components/enquiry-panel";
import { SpecReadout } from "@/components/spec-readout";
import { JsonLd } from "@/components/json-ld";
import { IconGauge, IconFuel, IconGearbox, IconRuler, IconCheck } from "@/components/icons";
import { ListingCTAButtons } from "@/components/dealer-cta-buttons";
import { getListingBySlug } from "@/lib/listings/client";
import { getDealerConfigBySeller } from "@/lib/dealers/config";
import type { Listing } from "@/lib/listings/types";
import {
  listingTitle,
  formatPrice,
  formatMileage,
  titleCase,
  WHEELBASE_SHORT,
} from "@/lib/listings/format";
import { modelPath } from "@/lib/listings/slug";
import { SITE, absUrl } from "@/lib/site";

type Params = { slug: string };

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
  const img = listingImageUrl(listing);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} · ${SITE.name}`,
      description,
      url: canonical,
      type: "website",
      images: img ? [{ url: img }] : undefined,
    },
  };
}

export default async function ListingPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const { listing } = await getListingBySlug(slug);
  if (!listing) notFound();

  const dealerConfig = getDealerConfigBySeller(listing.seller.name);
  const title = listingTitle(listing);
  const ogImage = listingImageUrl(listing);
  const readouts = [
    { icon: <IconGauge />, label: "Mileage", value: formatMileage(listing.mileage) },
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
      seller: { "@type": listing.seller_type === "dealer" ? "AutoDealer" : "Person", name: listing.seller.name },
    },
  };

  return (
    <>
      <JsonLd data={[vehicleLd, productLd]} />

      <Container className="py-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[var(--text-sm)] text-ink-500">
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
          <ListingHeader listing={listing} title={title} />
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left: gallery + spec */}
          <div className="min-w-0">
            <Gallery listing={listing} />

            <div className="mt-6 rounded-[var(--radius-lg)] border border-border bg-card">
              <SpecReadout items={readouts} className="px-2" />
            </div>

            {/* Description */}
            <section className="mt-8">
              <h2 className="font-display text-[var(--text-xl)] font-bold text-ink-900">Description</h2>
              <p className="mt-3 max-w-2xl whitespace-pre-line text-[var(--text-md)] leading-relaxed text-ink-600">
                {listing.description}
              </p>
            </section>

            {/* Features */}
            {listing.features.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display text-[var(--text-xl)] font-bold text-ink-900">
                  Specification &amp; features
                </h2>
                <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                  {listing.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[var(--text-md)] text-ink-700">
                      <IconCheck width={16} height={16} className="shrink-0 text-success-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Full spec table */}
            <section className="mt-10">
              <h2 className="mb-4 font-display text-[var(--text-xl)] font-bold text-ink-900">Full specification</h2>
              <SpecTable listing={listing} />
            </section>
          </div>

          {/* Right: sticky enquiry */}
          <aside className="lg:sticky lg:top-20 lg:self-start space-y-3">
            <EnquiryPanel listing={listing} />
            {dealerConfig && (
              <ListingCTAButtons
                listing={{
                  make: listing.make,
                  model: listing.model,
                  plate: listing.plate,
                  slug: listing.slug,
                }}
                dealer={dealerConfig}
              />
            )}
          </aside>
        </div>
      </Container>
    </>
  );
}

function ListingHeader({ listing, title }: { listing: Listing; title: string }) {
  return (
    <div>
      <Eyebrow>{listing.van_spec.body_style}</Eyebrow>
      <div className="mt-2 flex items-start justify-between gap-3">
        <h1 className="font-display text-[var(--text-3xl)] font-extrabold leading-tight text-ink-900">{title}</h1>
        {listing.year > 0 && <PlateBadge text={listing.plate || String(listing.year)} size="md" />}
      </div>
      <p className="mt-1.5 text-[var(--text-sm)] text-ink-500">
        {listing.year > 0 ? `${listing.year} · ` : ""}
        {listing.location.town}
        {listing.colour !== "—" ? ` · ${listing.colour}` : ""}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Price listing={listing} size="lg" />
        <StatusBadge status={listing.status} />
        {listing.ulez && <Badge tone="brand">ULEZ ready</Badge>}
        {listing.price_type === "no_vat" && <Badge tone="neutral">No VAT</Badge>}
      </div>
    </div>
  );
}
