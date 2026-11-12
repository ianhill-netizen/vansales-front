import Link from "next/link";
import { Photo } from "@/components/photo";
import type { Listing } from "@/lib/listings/types";
import { listingPath } from "@/lib/listings/slug";
import { listingTitle, formatMileageDisplay, formatGearbox, titleCase, WHEELBASE_SHORT } from "@/lib/listings/format";
import { isFeaturedSeller, getDealerConfigBySeller } from "@/lib/dealers/config";
import { supplierCode } from "@/lib/listings/supplier-code";
import { monthlyForListing, type FinanceTerms, type PayMode } from "@/lib/finance";
import { hasCardPhoto } from "@/lib/listings/photo";
import { Price, StatusBadge, Badge } from "./ui";
import { IconGearbox, IconRuler, IconArrow } from "./icons";
import { SaveButton } from "./save-button";

const FUEL_PILL: Record<string, string> = {
  electric:         "bg-success-500 text-white",
  petrol:           "bg-amber-500 text-white",
  hybrid:           "bg-teal-600 text-white",
  "plug-in hybrid": "bg-teal-600 text-white",
  phev:             "bg-teal-600 text-white",
};

export function ListingCard({
  listing,
  priority,
  cardIndex = 0,
  distanceMiles,
  payMode = "cash",
  financeTerms,
  highlighted = false,
}: {
  listing: Listing;
  priority?: boolean;
  cardIndex?: number;
  distanceMiles?: number;
  /** Cash = asking price only; finance = monthly payment first; both = both. Defaults to cash. */
  payMode?: PayMode;
  financeTerms?: FinanceTerms;
  /** Ring the card (map view: the matching pin is selected). */
  highlighted?: boolean;
}) {
  // No photo, no card (lib/listings/photo.ts): the data layer already drops these, this keeps a stray one (e.g. a saved van) from ever rendering a placeholder.
  if (!hasCardPhoto(listing)) return null;
  const monthly =
    payMode !== "cash" && financeTerms && listing.price != null
      ? Math.round(monthlyForListing(listing, financeTerms))
      : undefined;
  const title = listingTitle(listing);
  const sold = listing.status === "sold";
  const isPrivate = listing.seller_type === "private";
  const featured = isFeaturedSeller(listing.seller.name);
  const apiDealer = listing.dealer_contact; // a vansales-API dealer: the name links to its profile page
  const dealerConfig = apiDealer ? null : getDealerConfigBySeller(listing.seller.name);
  // Only dealski-sourced listings carry image_source (dealski-backend PR
  // #3173); it's undefined for every other source, which is equivalent to
  // "photo" here — no badge on a listing whose own image is a real photo.
  const isFallbackImage = !!listing.image_source && listing.image_source !== "photo";
  const fuelLower = listing.fuel.toLowerCase();
  const fuelPill = !["diesel", "—"].includes(fuelLower) ? (FUEL_PILL[fuelLower] ?? "bg-ink-600 text-white") : null;

  const displayTown    = dealerConfig?.location.town ?? listing.location.town;
  const displayMileage = formatMileageDisplay(listing.mileage, listing.condition);
  const displayGearbox = formatGearbox(listing.transmission);
  const displayWheelbase = listing.van_spec.wheelbase ? WHEELBASE_SHORT[listing.van_spec.wheelbase] : null;

  const specItems = [
    { icon: <IconGearbox width={12} height={12} />, value: displayGearbox },
    ...(displayWheelbase ? [{ icon: <IconRuler width={12} height={12} />, value: displayWheelbase }] : []),
  ].filter((s) => s.value && s.value !== "—");

  const subtitle = [
    listing.year > 0 ? String(listing.year) : null,
    displayMileage !== "—" ? displayMileage : null,
    listing.fuel && listing.fuel !== "—" ? titleCase(listing.fuel) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article data-listing-id={listing.id} className={`group relative flex flex-col overflow-hidden rounded-[var(--radius-xl)] border bg-white shadow-[var(--shadow-sm)] ${highlighted ? "border-brand-500 ring-2 ring-brand-500/40" : "border-border"} transition-all duration-[var(--dur-base)] ease-[var(--ease-out)] hover:-translate-y-1.5 hover:border-transparent hover:shadow-[var(--shadow-card-hover)]`}>

      {/* ── Media ────────────────────────────────────────────────────────── */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        <Photo
          src={listing.images[0].url}
          alt={listing.images[0].alt}
          sizes="(min-width: 1280px) 24vw, (min-width: 768px) 33vw, 100vw"
          first={!!priority}
          className="object-cover transition-transform duration-[var(--dur-slow)] group-hover:scale-[1.03]"
        />

        {/* Bottom gradient for badge legibility */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
          style={{ background: "linear-gradient(to top, rgba(8,14,28,0.45) 0%, transparent 100%)" }}
          aria-hidden
        />

        {/* Bottom-left: flags a library/placeholder fallback image, not the vehicle's own photo */}
        {isFallbackImage && (
          <span className="absolute bottom-2.5 left-3 rounded-[var(--radius-pill)] bg-ink-900/70 px-2.5 py-1 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-white backdrop-blur-sm">
            Stock image
          </span>
        )}

        {/* Top-left badges */}
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
          {featured ? (
            <Badge tone="featured">Featured</Badge>
          ) : listing.seller_type === "private" ? (
            <Badge tone="neutral">Private seller</Badge>
          ) : (
            <Badge tone="brand">Dealer</Badge>
          )}
          {listing.condition === "new" && <Badge tone="brand">New</Badge>}
          {listing.hpi_checked && <Badge tone="success">HPI checked</Badge>}
          {listing.status === "reserved" && <StatusBadge status="reserved" />}
          {fuelPill && (
            <span className={`rounded-[var(--radius-pill)] px-2.5 py-1 text-[length:var(--text-2xs)] font-semibold uppercase tracking-[var(--tracking-wide)] ${fuelPill}`}>
              {titleCase(listing.fuel)}
            </span>
          )}
        </div>

        {/* ULEZ badge — top-right */}
        {listing.ulez && (
          <span className="absolute right-3 top-3 rounded-[var(--radius-pill)] bg-success-500/90 px-2.5 py-1 text-[length:var(--text-2xs)] font-bold uppercase tracking-[var(--tracking-wide)] text-white backdrop-blur-sm">
            ULEZ ✓
          </span>
        )}

        {/* Save (heart): vansales-API adverts only, they are the ones the saved page can look up */}
        {listing.source === "vansales" && !sold && <SaveButton id={listing.source_id} className="absolute bottom-3 right-3" />}

        {/* Sold overlay */}
        {sold && (
          <div className="absolute inset-0 grid place-items-center bg-ink-900/40 backdrop-blur-[2px]">
            <span className="rotate-[-8deg] rounded-[var(--radius-sm)] border-2 border-white/90 px-5 py-1.5 font-display text-[length:var(--text-xl)] font-extrabold uppercase tracking-wide text-white shadow-lg">
              Sold
            </span>
          </div>
        )}
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-4 pt-3.5">

        {/* Seller + location meta */}
        <p className="mb-2 flex flex-wrap items-center gap-x-1.5 text-[length:var(--text-xs)] text-ink-400">
          {isPrivate ? (
            <span className="font-semibold text-ink-500">Private seller</span>
          ) : apiDealer ? (
            <span className="relative z-10 inline-flex">
              <Link href={`/dealer/${apiDealer.slug}`} className="font-semibold text-ink-500 hover:text-brand-600">
                {apiDealer.name}
              </Link>
            </span>
          ) : dealerConfig ? (
            <span className="relative z-10 inline-flex">
              <Link
                href={`/dealer/${dealerConfig.slug}`}
                className="font-semibold text-ink-500 hover:text-brand-600"
              >
                {listing.seller.name}
              </Link>
            </span>
          ) : (
            <span className="font-semibold text-ink-500">{supplierCode(listing.seller.name)}</span>
          )}
          {!isPrivate && listing.stock_ref && (
            <span className="font-mono text-ink-400">{listing.stock_ref}</span>
          )}
          <span aria-hidden>·</span>
          {distanceMiles != null && (
            <>
              <span className="font-semibold text-brand-700">{Math.round(distanceMiles) < 1 ? "Under a mile" : Math.round(distanceMiles) === 1 ? "1 mile" : `${Math.round(distanceMiles)} miles`}</span>
              <span aria-hidden>·</span>
            </>
          )}
          <span>{displayTown}</span>
        </p>

        {/* Title */}
        <h3 className="font-display text-[length:var(--text-base)] font-bold leading-[1.2] text-ink-900">
          <Link href={listingPath(listing)} className="after:absolute after:inset-0">
            <span className="line-clamp-2">{title}</span>
          </Link>
        </h3>

        {/* Subtitle: full year · mileage · fuel (replaces the old two-digit plate box) */}
        {subtitle && <p className="mt-1 truncate text-[length:var(--text-sm)] font-medium text-ink-500">{subtitle}</p>}

        {listing.derivative && (
          <p className="mt-0.5 truncate text-[length:var(--text-xs)] text-ink-400">{listing.derivative}</p>
        )}

        {/* Price row */}
        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            {payMode === "finance" && monthly != null ? (
              <>
                <p className="flex items-baseline gap-1.5">
                  <span className="text-[length:var(--text-2xl)] font-bold leading-none tabular-nums text-ink-900">£{monthly.toLocaleString("en-GB")}</span>
                  <span className="text-[length:var(--text-xs)] font-medium text-ink-500">/month</span>
                </p>
                <p className="mt-1 text-[length:var(--text-xs)] text-ink-400">Cash price {listing.price != null ? `£${listing.price.toLocaleString("en-GB")}` : "POA"}</p>
              </>
            ) : (
              <>
                <Price listing={listing} size="md" />
                {payMode === "both" && monthly != null && (
                  <p className="mt-1 text-[length:var(--text-sm)] font-semibold text-brand-700">or £{monthly.toLocaleString("en-GB")}/month</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Spec strip (year, mileage and fuel are in the subtitle above) */}
        {specItems.length > 0 && <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 border-t border-surface-2 pt-3">
          {specItems.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[length:var(--text-xs)] text-ink-500">
              <span className="text-ink-400" aria-hidden>{s.icon}</span>
              {s.value}
            </div>
          ))}
        </div>}

        {/* Enquire CTA — fills to orange on card hover */}
        {!sold && (
          <div className="relative mt-4 z-10 overflow-hidden rounded-[var(--radius-md)]">
            <Link
              href={`${listingPath(listing)}?enquire=1#enquire`}
              className="relative z-10 flex w-full items-center justify-center gap-2 border border-border bg-surface-1 py-2.5 text-[length:var(--text-sm)] font-semibold text-ink-600 transition-all duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:border-transparent group-hover:text-white rounded-[var(--radius-md)]"
            >
              Enquire <IconArrow width={14} height={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-[var(--dur-base)] group-hover:opacity-100 rounded-[var(--radius-md)]"
              style={{ background: "linear-gradient(135deg, #f47c1e 0%, #d96410 100%)" }}
              aria-hidden
            />
          </div>
        )}
      </div>
    </article>
  );
}
