import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Container, Price, StatusBadge, Badge } from "@/components/ui";
import { Gallery } from "@/components/gallery";
import { SpecTable } from "@/components/spec-table";
import { EnquiryPanel } from "@/components/enquiry-panel";
import { SaveButton } from "@/components/save-button";
import { HpiCard } from "@/components/hpi-card";
import { JsonLd } from "@/components/json-ld";
import { CONDITION_LABEL, detailRows, VAT_BADGE, warrantyText } from "@/lib/listings/vanDetails";
import { offerPriceLd, vatOnTop } from "@/lib/listings/vat";
import { IconGauge, IconFuel, IconGearbox, IconCheck, IconShield } from "@/components/icons";
import { ListingTabs, type ListingTab } from "@/components/listing-tabs";
import { ListingActions } from "@/components/listing-actions";
import { FinanceCalculator } from "@/components/finance-calculator";
import { dealerFinanceLine, isSwissVans } from "@/lib/listings/finance-scope";
import { listingActionLinks } from "@/lib/dealers/actions";
import { getListingBySlug } from "@/lib/listings/client";
import { fetchListingState } from "@/lib/listings/sources/vansales";
import { goneTarget, isListingSlug } from "@/lib/listings/gone";
import { getDealerConfigBySeller } from "@/lib/dealers/config";
import type { Listing } from "@/lib/listings/types";
import {
  listingTitle,
  formatPrice,
  formatMileage,
  formatMileageDisplay,
  titleCase,
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
  if (!listing) {
    // A sold / removed van's URL is a permanent redirect (308) to its model page, never a 404. Only a DEFINITIVE answer from the backend redirects: getListingBySlug is also null when the API blinked, and a 308 is cached for good.
    if (!isListingSlug(slug)) notFound();
    const state = await fetchListingState(slug);
    if (state === null) throw new Error(`vansales API unavailable while resolving /listing/${slug}`);
    if (state.state === "active") throw new Error(`/listing/${slug} is active but could not be loaded`);
    if (state.state === "hidden") notFound(); // a draft or a suspended dealer's van: may come back, so a 404, not a permanent move
    permanentRedirect(goneTarget(slug, state.state === "gone" ? state : null));
  }

  const dealerConfig = listing.dealer_contact ? null : getDealerConfigBySeller(listing.seller.name);
  const actionLinks = listingActionLinks(listing, dealerConfig);
  const isVansalesAdvert = listing.source === "vansales" && /^\d+$/.test(listing.source_id);   // the new stacked buttons need the advert's numeric id (the VS- reference)
  const displayTown = dealerConfig?.location.town ?? listing.location.town;
  const title = listingTitle(listing);
  const ogImage = listingImageUrl(listing);
  const specRows = detailRows(listing.details);

  const engine = listing.engine_cc ? `${(listing.engine_cc / 1000).toFixed(1)}L` : "—";
  const stats = [
    { icon: <IconGauge width={14} height={14} />, label: "Mileage", value: formatMileageDisplay(listing.mileage, listing.condition) },
    { icon: <IconFuel width={14} height={14} />, label: "Fuel", value: titleCase(listing.fuel) || "—" },
    { icon: <IconGearbox width={14} height={14} />, label: "Engine", value: engine },
    { icon: <IconShield width={14} height={14} />, label: "MOT expiry", value: listing.mot_expiry ? formatMotDate(listing.mot_expiry) : "—" },
  ];
  const overview = (listing.description ?? "").trim();
  const short = overview.length > 320 ? `${overview.slice(0, 320).replace(/\s+\S*$/, "")}…` : overview;
  const featureTiles = [...(listing.extras ?? []).map((f) => f.label), ...listing.features];
  const hasHistory = !!(listing.mot_expiry || listing.last_mot_mileage != null || listing.hpi_check || listing.hpi_checked);
  const tabs: ListingTab[] = [
    {
      id: "overview", label: "Overview", content: (
        <div className="space-y-6">
          {short && <p className="max-w-2xl whitespace-pre-line text-[length:var(--text-md)] leading-relaxed text-ink-600">{short}</p>}
          {featureTiles.length > 0 && (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Features">
              {featureTiles.map((f) => (
                <li key={f} className="flex items-center gap-2 rounded-[var(--radius-md)] border border-border bg-card px-3 py-2 text-[length:var(--text-sm)] text-ink-800"><IconCheck width={14} height={14} className="shrink-0 text-success-500" aria-hidden />{f}</li>
              ))}
            </ul>
          )}
          {warrantyText(listing.warranty_type, listing.warranty_expiry) && (
            <p className="rounded-[var(--radius-lg)] border border-border bg-card px-4 py-3 text-[length:var(--text-md)] font-medium text-ink-800">{warrantyText(listing.warranty_type, listing.warranty_expiry)}</p>
          )}
        </div>
      ),
    },
    {
      id: "spec", label: "Spec", content: (
        <div className="space-y-6">
          {specRows.length > 0 && (
            <dl className="divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-card" aria-label="Specification">
              {specRows.map((r) => (
                <div key={r.label} className="flex items-baseline justify-between gap-4 px-4 py-2.5">
                  <dt className="text-[length:var(--text-sm)] text-ink-500">{r.label}</dt>
                  <dd className="text-right font-medium text-ink-900">{r.value}</dd>
                </div>
              ))}
            </dl>
          )}
          <SpecTable listing={listing} />
        </div>
      ),
    },
    {
      id: "description", label: "Description", content: (
        <p className="max-w-2xl whitespace-pre-line text-[length:var(--text-md)] leading-relaxed text-ink-600">{listing.description}</p>
      ),
    },
    ...(hasHistory ? [{
      id: "history", label: "History", content: (
        <div className="space-y-6">
          {(listing.mot_expiry || listing.last_mot_mileage != null) && (
            <section className="rounded-[var(--radius-lg)] border border-border bg-card px-4 py-3" aria-label="MOT">
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
          {listing.hpi_check && <HpiCard result={listing.hpi_check} />}
        </div>
      ),
    }] : []),
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
      ...offerPriceLd(listing.price, listing.vat_status),
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

        {/* Mobile order: gallery, header + price, buttons, stats, calculator, tabs, dealer card + form. Desktop: gallery + tabs + form on the left, the sticky column (header, buttons, stats, calculator) on the right. */}
        <div className="mt-5 grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <Gallery listing={listing} />
          </div>

          <aside className="min-w-0 space-y-5 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
            <ListingHeader listing={listing} title={title} displayTown={displayTown} dealskiManaged={listing.source === "dealski" || !!(dealerConfig ?? getDealerConfigBySeller(listing.dealer_contact?.name ?? listing.seller.name))?.dealskiTenant} />
            {/* Enquire + WhatsApp, then small pills (Call, Text me, Test drive, Finance, Part exchange). Private sellers get what vansales offers on their advert. */}
            {isVansalesAdvert ? (
              <ListingActions
                links={actionLinks}
                sold={listing.status === "sold"}
                buyer={{ listingId: listing.source_id, label: [listing.vrm, listing.make, listing.model].filter(Boolean).join(" "), shareUrl: absUrl(`/listing/${slug}`), shareTitle: title, partExchange: listing.seller_type === "dealer", swissFinance: isSwissVans(listing) }}
              />
            ) : (
              <ListingActions links={actionLinks} sold={listing.status === "sold"} />
            )}
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2" data-testid="key-stats">
              {stats.map((t) => (
                <div key={t.label} className="rounded-[var(--radius-lg)] border border-border bg-card px-3 py-2.5">
                  <dt className="flex items-center gap-1.5 text-[length:var(--text-xs)] text-ink-500"><span aria-hidden className="text-ink-400">{t.icon}</span>{t.label}</dt>
                  <dd className="mt-0.5 font-semibold text-ink-900">{t.value}</dd>
                </div>
              ))}
            </dl>
            {isVansalesAdvert && isSwissVans(listing) && listing.price != null && listing.price > 0 && (
              <FinanceCalculator price={listing.price} applyHref={actionLinks.financeHref ?? "/hire-purchase-vans"} warranties={listing.warranty_addons ?? []} finance={listing.finance ?? null} vatQualifying={vatOnTop(listing.vat_status)} />
            )}
            {dealerFinanceLine(listing) && <p className="text-[length:var(--text-sm)] text-ink-600" data-testid="dealer-finance-line">{dealerFinanceLine(listing)}</p>}
          </aside>

          <div className="min-w-0 lg:col-start-1 lg:row-start-2">
            <ListingTabs tabs={tabs} />
          </div>

          <div className="min-w-0 lg:col-start-1 lg:row-start-3">
            <EnquiryPanel listing={listing} />
          </div>
        </div>
      </Container>
    </>
  );
}

function ListingHeader({ listing, title, displayTown, dealskiManaged }: { listing: Listing; title: string; displayTown: string; dealskiManaged: boolean }) {
  return (
    <div>
      {/* Badges first */}
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={listing.status} />
        <Badge tone="neutral">{listing.condition === "new" ? "New" : "Used"}</Badge>
        {listing.vehicle_condition && <Badge tone="neutral">{CONDITION_LABEL[listing.vehicle_condition]}</Badge>}
        {(listing.vat_status === "vat_qualifying" || listing.vat_status === "ex_vat" || listing.vat_status === "inc_vat") && <Badge tone="neutral">{VAT_BADGE[listing.vat_status]}</Badge>}
        {listing.seller_type === "private" && <Badge tone="neutral">Private seller</Badge>}
        {dealskiManaged && <Badge tone="brand">Dealski-managed</Badge>}
        {listing.hpi_checked && !listing.hpi_check && (
          <span title={listing.hpi_checked_at ? `Vehicle history checked on ${formatMotDate(listing.hpi_checked_at)}: clear` : "Vehicle history checked"}>
            <Badge tone="success"><IconShield width={12} height={12} aria-hidden />HPI checked</Badge>
          </span>
        )}
        {listing.ulez_compliant === true && <Badge tone="brand">ULEZ compliant</Badge>}
        {listing.ulez_compliant === false && <Badge tone="warning">Not ULEZ compliant</Badge>}
        {listing.ulez_compliant == null && listing.ulez && <Badge tone="brand">ULEZ ready</Badge>}
        {listing.v5_present === true && <Badge tone="success">V5 present</Badge>}
        {listing.price_type === "no_vat" && <Badge tone="neutral">No VAT</Badge>}
        {listing.seller_type === "dealer" && listing.price_type === "unknown" && listing.price != null && <Badge tone="warning">VAT status to be confirmed: ask the dealer before relying on this price</Badge>}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <h1 className="font-display text-[length:var(--text-2xl)] font-extrabold leading-tight text-ink-900">{title}</h1>
        {listing.source === "vansales" && <SaveButton id={listing.source_id} label />}
      </div>
      <p className="mt-1.5 text-[length:var(--text-sm)] text-ink-500">
        {[listing.year > 0 ? String(listing.year) : null, displayTown, listing.colour !== "—" ? listing.colour : null, /^\d{2}$/.test(listing.plate ?? "") ? `${listing.plate} plate` : null].filter(Boolean).join(" · ")}
      </p>
      <div className="mt-3"><Price listing={listing} size="lg" /></div>
      {listing.price != null && listing.price_type === "unknown" && <p className="mt-1 text-[length:var(--text-xs)] text-ink-500" data-testid="vat-unknown">VAT status to be confirmed</p>}
    </div>
  );
}
