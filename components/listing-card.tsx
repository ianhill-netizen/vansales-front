import Link from "next/link";
import Image from "next/image";
import type { Listing } from "@/lib/listings/types";
import { listingPath } from "@/lib/listings/slug";
import { listingTitle, formatMileage, titleCase, WHEELBASE_SHORT } from "@/lib/listings/format";
import { cardModelImage } from "@/lib/models/image";
import { VanPhoto } from "./van-photo";
import { Price, PlateBadge, StatusBadge, Badge } from "./ui";
import { SpecReadout } from "./spec-readout";
import { IconGauge, IconFuel, IconGearbox, IconRuler, IconPin, IconArrow } from "./icons";

// Colored badge for non-diesel fuel types (diesel is assumed default, omitted)
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
  const hasRealPhoto = listing.images[0]?.url?.startsWith("http");
  const modelImg = hasRealPhoto ? null : cardModelImage(listing, cardIndex);
  const fuelLower = listing.fuel.toLowerCase();
  const fuelPill = !["diesel", "—"].includes(fuelLower) ? (FUEL_PILL[fuelLower] ?? "bg-ink-600 text-white") : null;

  const readouts = [
    { icon: <IconGauge />, label: "Mileage", value: formatMileage(listing.mileage) },
    { icon: <IconGearbox />, label: "Gearbox", value: titleCase(listing.transmission) },
    {
      icon: <IconRuler />,
      label: "Wheelbase",
      value: listing.van_spec.wheelbase ? WHEELBASE_SHORT[listing.van_spec.wheelbase] : "—",
    },
    { icon: <IconFuel />, label: "Fuel", value: titleCase(listing.fuel) },
  ];

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-xs)] transition-[box-shadow,transform,border-color] duration-[var(--dur-base)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-md)]">
      {/* Media */}
      <div className="relative aspect-[16/11] overflow-hidden bg-surface-2">
        {hasRealPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.images[0].url}
            alt={listing.images[0].alt}
            className="size-full object-cover"
            loading={priority ? "eager" : "lazy"}
          />
        ) : modelImg ? (
          <Image
            src={modelImg.src}
            alt={modelImg.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={modelImg.fit === "contain" ? "object-contain p-4" : "object-cover"}
            priority={priority}
          />
        ) : (
          <VanPhoto listing={listing} index={0} className="size-full" priority={priority} />
        )}

        <div className="absolute left-3 top-3 flex items-center gap-2">
          <StatusBadge status={listing.status} />
          {listing.condition === "new" && <Badge tone="brand">New</Badge>}
          {listing.seller_type === "private"
            ? <Badge tone="neutral">Private seller</Badge>
            : <Badge tone="brand">Dealer</Badge>
          }
          {fuelPill && (
            <span
              className={`rounded-[var(--radius-pill)] px-2.5 py-1 text-[var(--text-2xs)] font-semibold uppercase tracking-[var(--tracking-wide)] ${fuelPill}`}
            >
              {titleCase(listing.fuel)}
            </span>
          )}
        </div>

        {listing.ulez && (
          <span className="absolute right-3 top-3 rounded-[var(--radius-pill)] bg-ink-900/85 px-2.5 py-1 text-[var(--text-2xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-white backdrop-blur">
            ULEZ
          </span>
        )}

        {modelImg && !hasRealPhoto && !sold && (
          <span className="absolute bottom-2 left-2 rounded-[var(--radius-xs)] bg-ink-900/65 px-1.5 py-0.5 text-[var(--text-2xs)] font-medium text-white/90 backdrop-blur">
            Library image
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
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-[var(--text-lg)] font-bold leading-snug text-ink-900">
            <Link href={listingPath(listing)} className="after:absolute after:inset-0">
              <span className="line-clamp-2">{title}</span>
            </Link>
          </h3>
          {listing.year > 0 && <PlateBadge text={listing.plate || String(listing.year)} size="sm" />}
        </div>

        <p className="mt-1 flex items-center gap-1.5 text-[var(--text-sm)] text-ink-500">
          <IconPin width={14} height={14} />
          {listing.location.town}
          {listing.year > 0 && <span aria-hidden>· {listing.year}</span>}
          <span aria-hidden>· {listing.van_spec.body_style}</span>
        </p>

        <div className="mt-3">
          <Price listing={listing} size="md" />
        </div>

        <div className="mt-auto pt-3">
          <SpecReadout items={readouts} className="-mx-1 border-t border-border pt-1" />
        </div>

        {!sold && (
          <div className="mt-3">
            <div className="flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-md)] bg-ink-900 px-4 py-2.5 text-[var(--text-sm)] font-semibold text-white transition-colors group-hover:bg-ink-800">
              Enquire <IconArrow width={14} height={14} />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
