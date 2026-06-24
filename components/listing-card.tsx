import Link from "next/link";
import type { Listing } from "@/lib/listings/types";
import { listingPath } from "@/lib/listings/slug";
import { listingTitle, formatMileageDisplay, formatGearbox, titleCase, WHEELBASE_SHORT } from "@/lib/listings/format";
import { isFeaturedSeller, getDealerConfigBySeller } from "@/lib/dealers/config";
import { Price, PlateBadge, StatusBadge, Badge } from "./ui";
import { IconGauge, IconFuel, IconGearbox, IconRuler, IconArrow } from "./icons";

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
}: {
  listing: Listing;
  priority?: boolean;
  cardIndex?: number;
  distanceMiles?: number;
}) {
  const title = listingTitle(listing);
  const sold = listing.status === "sold";
  const featured = isFeaturedSeller(listing.seller.name);
  const dealerConfig = getDealerConfigBySeller(listing.seller.name);
  const hasRealPhoto = listing.images[0]?.url?.startsWith("http");
  const fuelLower = listing.fuel.toLowerCase();
  const fuelPill = !["diesel", "—"].includes(fuelLower) ? (FUEL_PILL[fuelLower] ?? "bg-ink-600 text-white") : null;

  const displayTown    = dealerConfig?.location.town ?? listing.location.town;
  const displayMileage = formatMileageDisplay(listing.mileage, listing.condition);
  const displayGearbox = formatGearbox(listing.transmission);
  const displayWheelbase = listing.van_spec.wheelbase ? WHEELBASE_SHORT[listing.van_spec.wheelbase] : null;

  const specItems = [
    { icon: <IconFuel    width={12} height={12} />, value: titleCase(listing.fuel) },
    { icon: <IconGearbox width={12} height={12} />, value: displayGearbox },
    ...(displayWheelbase ? [{ icon: <IconRuler width={12} height={12} />, value: displayWheelbase }] : []),
    { icon: <IconGauge   width={12} height={12} />, value: displayMileage },
  ].filter((s) => s.value && s.value !== "—");

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-sm)] transition-all duration-[var(--dur-base)] ease-[var(--ease-out)] hover:-translate-y-1.5 hover:border-transparent hover:shadow-[var(--shadow-card-hover)]">

      {/* ── Media ────────────────────────────────────────────────────────── */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        {hasRealPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.images[0].url}
            alt={listing.images[0].alt}
            className="size-full object-cover transition-transform duration-[var(--dur-slow)] group-hover:scale-[1.03]"
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2.5">
            <svg viewBox="0 0 64 32" fill="none" className="h-8 w-16 text-ink-200" aria-hidden>
              <rect x="1" y="11" width="62" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
              <rect x="8" y="3" width="28" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
              <circle cx="14" cy="29" r="3" stroke="currentColor" strokeWidth="2"/>
              <circle cx="50" cy="29" r="3" stroke="currentColor" strokeWidth="2"/>
              <line x1="36" y1="11" x2="36" y2="17" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <p className="font-mono text-[var(--text-2xs)] uppercase tracking-[var(--tracking-eyebrow)] text-ink-300">
              Photo coming soon
            </p>
          </div>
        )}

        {/* Bottom gradient for badge legibility */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
          style={{ background: "linear-gradient(to top, rgba(8,14,28,0.45) 0%, transparent 100%)" }}
          aria-hidden
        />

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
          {listing.status === "reserved" && <StatusBadge status="reserved" />}
          {fuelPill && (
            <span className={`rounded-[var(--radius-pill)] px-2.5 py-1 text-[var(--text-2xs)] font-semibold uppercase tracking-[var(--tracking-wide)] ${fuelPill}`}>
              {titleCase(listing.fuel)}
            </span>
          )}
        </div>

        {/* ULEZ badge — top-right */}
        {listing.ulez && (
          <span className="absolute right-3 top-3 rounded-[var(--radius-pill)] bg-success-500/90 px-2.5 py-1 text-[var(--text-2xs)] font-bold uppercase tracking-[var(--tracking-wide)] text-white backdrop-blur-sm">
            ULEZ ✓
          </span>
        )}

        {/* Sold overlay */}
        {sold && (
          <div className="absolute inset-0 grid place-items-center bg-ink-900/40 backdrop-blur-[2px]">
            <span className="rotate-[-8deg] rounded-[var(--radius-sm)] border-2 border-white/90 px-5 py-1.5 font-display text-[var(--text-xl)] font-extrabold uppercase tracking-wide text-white shadow-lg">
              Sold
            </span>
          </div>
        )}
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-4 pt-3.5">

        {/* Seller + location meta */}
        <p className="mb-2 flex flex-wrap items-center gap-x-1.5 text-[var(--text-xs)] text-ink-400">
          {dealerConfig ? (
            <span className="relative z-10 inline-flex">
              <Link
                href={`/dealer/${dealerConfig.slug}`}
                className="font-semibold text-ink-500 hover:text-brand-600"
              >
                {listing.seller.name}
              </Link>
            </span>
          ) : (
            <span className="font-semibold text-ink-500">{listing.seller.name}</span>
          )}
          {listing.stock_ref && (
            <span className="font-mono text-ink-400">{listing.stock_ref}</span>
          )}
          <span aria-hidden>·</span>
          <span>{displayTown}</span>
          {distanceMiles != null && (
            <>
              <span aria-hidden>·</span>
              <span>{Math.round(distanceMiles)} mi away</span>
            </>
          )}
        </p>

        {/* Title */}
        <h3 className="font-display text-[var(--text-base)] font-bold leading-[1.2] text-ink-900">
          <Link href={listingPath(listing)} className="after:absolute after:inset-0">
            <span className="line-clamp-2">{title}</span>
          </Link>
        </h3>

        {listing.derivative && (
          <p className="mt-0.5 truncate text-[var(--text-xs)] text-ink-400">{listing.derivative}</p>
        )}

        {/* Price row */}
        <div className="mt-3 flex items-end justify-between gap-2">
          <Price listing={listing} size="md" />
          {listing.year > 0 && (
            <PlateBadge text={listing.plate || String(listing.year)} size="sm" />
          )}
        </div>

        {/* Spec strip */}
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 border-t border-surface-2 pt-3">
          {specItems.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[var(--text-xs)] text-ink-500">
              <span className="text-ink-400" aria-hidden>{s.icon}</span>
              {s.value}
            </div>
          ))}
        </div>

        {/* Enquire CTA — fills to orange on card hover */}
        {!sold && (
          <div className="relative mt-4 z-10 overflow-hidden rounded-[var(--radius-md)]">
            <Link
              href={`${listingPath(listing)}?enquire=1#enquire`}
              className="relative z-10 flex w-full items-center justify-center gap-2 border border-border bg-surface-1 py-2.5 text-[var(--text-sm)] font-semibold text-ink-600 transition-all duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:border-transparent group-hover:text-white rounded-[var(--radius-md)]"
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
