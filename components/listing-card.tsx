import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/lib/listings/types";
import { listingPath } from "@/lib/listings/slug";
import { listingTitle, formatMileageDisplay, formatGearbox, titleCase, WHEELBASE_SHORT } from "@/lib/listings/format";
import { isFeaturedSeller, getDealerConfigBySeller } from "@/lib/dealers/config";
import { getListingCardImage } from "@/lib/media/model-images";
import { SpecCard } from "./spec-card";
import { Price, PlateBadge, StatusBadge, Badge } from "./ui";
import { IconGauge, IconFuel, IconGearbox, IconRuler, IconArrow } from "./icons";

const FUEL_PILL: Record<string, string> = {
  electric: "bg-success-500 text-white",
  petrol: "bg-amber-500/90 text-white",
  hybrid: "bg-teal-600 text-white",
  "plug-in hybrid": "bg-teal-600 text-white",
  phev: "bg-teal-600 text-white",
};

export function ListingCard({
  listing,
  priority,
  cardIndex = 0,
}: {
  listing: Listing;
  priority?: boolean;
  cardIndex?: number;
}) {
  const title = listingTitle(listing);
  const sold = listing.status === "sold";
  const featured = isFeaturedSeller(listing.seller.name);
  const dealerConfig = getDealerConfigBySeller(listing.seller.name);
  const hasRealPhoto = listing.images[0]?.url?.startsWith("http");
  const modelImage = hasRealPhoto ? null : getListingCardImage(listing.make, listing.model, cardIndex);
  const fuelLower = listing.fuel.toLowerCase();
  const fuelPill = !["diesel", "—"].includes(fuelLower) ? (FUEL_PILL[fuelLower] ?? "bg-ink-600 text-white") : null;

  const displayTown = dealerConfig?.location.town ?? listing.location.town;
  const displayMileage = formatMileageDisplay(listing.mileage, listing.condition);
  const displayGearbox = formatGearbox(listing.transmission);
  const displayWheelbase = listing.van_spec.wheelbase ? WHEELBASE_SHORT[listing.van_spec.wheelbase] : null;

  const specItems = [
    { icon: <IconFuel width={13} height={13} />, value: titleCase(listing.fuel) },
    { icon: <IconGearbox width={13} height={13} />, value: displayGearbox },
    ...(displayWheelbase ? [{ icon: <IconRuler width={13} height={13} />, value: displayWheelbase }] : []),
    { icon: <IconGauge width={13} height={13} />, value: displayMileage },
  ].filter((s) => s.value && s.value !== "—");

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-xs)] transition-[box-shadow,transform,border-color] duration-[var(--dur-base)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-md)]">
      {/* Media */}
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-1">
        {hasRealPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.images[0].url}
            alt={listing.images[0].alt}
            className="size-full object-cover"
            loading={priority ? "eager" : "lazy"}
          />
        ) : modelImage ? (
          <>
            <Image
              src={modelImage.path}
              alt={modelImage.alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain p-4"
              priority={priority}
            />
            <span className="absolute bottom-2 right-2 rounded-[var(--radius-pill)] bg-ink-900/60 px-2 py-0.5 font-mono text-[var(--text-2xs)] text-white/80 backdrop-blur">
              Library image
            </span>
          </>
        ) : (
          <SpecCard listing={listing} className="size-full" />
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
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

        {listing.ulez && (
          <span className="absolute right-3 top-3 rounded-[var(--radius-pill)] bg-ink-900/85 px-2.5 py-1 text-[var(--text-2xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-white backdrop-blur">
            ULEZ
          </span>
        )}

        {sold && (
          <div className="absolute inset-0 grid place-items-center bg-ink-900/35">
            <span className="rotate-[-7deg] rounded-[var(--radius-sm)] border-2 border-white/90 px-4 py-1 font-display text-[var(--text-xl)] font-extrabold uppercase tracking-wide text-white">
              Sold
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        {/* Dealer + location + year line */}
        <p className="mb-1 flex flex-wrap items-center gap-x-1.5 text-[var(--text-xs)] text-ink-400">
          {dealerConfig ? (
            <Link
              href={`/dealer/${dealerConfig.slug}`}
              className="relative z-10 font-semibold text-ink-600 hover:text-brand-600"
            >
              {listing.seller.name}
            </Link>
          ) : (
            <span className="font-semibold text-ink-600">{listing.seller.name}</span>
          )}
          <span aria-hidden>·</span>
          <span>{displayTown}</span>
          {listing.year > 0 && <><span aria-hidden>·</span><span>{listing.year}</span></>}
        </p>

        {/* Title */}
        <h3 className="font-display text-[var(--text-base)] font-bold leading-snug text-ink-900">
          <Link href={listingPath(listing)} className="after:absolute after:inset-0">
            <span className="line-clamp-2">{title}</span>
          </Link>
        </h3>

        {listing.derivative && (
          <p className="mt-0.5 truncate text-[var(--text-xs)] text-ink-400">{listing.derivative}</p>
        )}

        {/* Price */}
        <div className="mt-3">
          <div className="flex items-center justify-between gap-2">
            <Price listing={listing} size="md" />
            {listing.year > 0 && <PlateBadge text={listing.plate || String(listing.year)} size="sm" />}
          </div>
        </div>

        {/* Spec strip — flex-wrap avoids divide-x overlap on mobile */}
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 border-t border-border pt-3">
          {specItems.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[var(--text-xs)] text-ink-500">
              <span className="text-ink-400" aria-hidden>{s.icon}</span>
              {s.value}
            </div>
          ))}
        </div>

        {/* Enquire CTA */}
        {!sold && (
          <div className="mt-4">
            <div className="flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-md)] bg-ink-900 py-2.5 text-[var(--text-sm)] font-bold text-white transition-colors group-hover:bg-brand-600">
              Enquire <IconArrow width={14} height={14} />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
