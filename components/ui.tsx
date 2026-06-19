import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { Listing } from "@/lib/listings/types";
import { formatPrice, vatLabel, STATUS_LABEL } from "@/lib/listings/format";

/* -----------------------------------------------------------------------------
   Layout
   -------------------------------------------------------------------------- */
export function Container({
  children,
  className = "",
  size = "default",
}: {
  children: ReactNode;
  className?: string;
  size?: "default" | "wide" | "narrow";
}) {
  const max =
    size === "wide" ? "max-w-[1320px]" : size === "narrow" ? "max-w-[760px]" : "max-w-[var(--container-max)]";
  return (
    <div className={`mx-auto w-full ${max} px-[var(--gutter)] ${className}`}>{children}</div>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`eyebrow ${className}`}>{children}</p>;
}

/* -----------------------------------------------------------------------------
   Button — primary (ink), accent (plate-yellow), dark, ghost, outline.
   Renders <Link> or <button>.
   -------------------------------------------------------------------------- */
type ButtonVariant = "primary" | "accent" | "dark" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--radius-md)] transition-[transform,background-color,box-shadow] duration-[var(--dur-base)] ease-[var(--ease-out)] active:translate-y-px disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const BTN_VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-ink-900 text-white shadow-[var(--shadow-sm)] hover:bg-ink-800 hover:shadow-[var(--shadow-md)]",
  accent:
    "bg-accent-500 text-plate-ink shadow-[var(--shadow-sm)] hover:bg-accent-400 hover:shadow-[var(--shadow-md)]",
  dark: "bg-ink-900 text-white hover:bg-ink-800 shadow-[var(--shadow-sm)]",
  ghost: "bg-transparent text-ink-800 hover:bg-surface-2",
  outline: "bg-surface-0 text-ink-800 border border-border-strong hover:border-ink-400 hover:bg-surface-1",
};

const BTN_SIZE: Record<ButtonSize, string> = {
  sm: "text-[var(--text-sm)] h-9 px-3.5",
  md: "text-[var(--text-base)] h-11 px-5",
  lg: "text-[var(--text-md)] h-13 px-7 [height:3.25rem]",
};

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<"button">, "ref">;

export function Button({
  variant = "primary",
  size = "md",
  href,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const cls = `${BTN_BASE} ${BTN_VARIANT[variant]} ${BTN_SIZE[size]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

/* -----------------------------------------------------------------------------
   Badge + StatusBadge
   -------------------------------------------------------------------------- */
type BadgeTone = "neutral" | "brand" | "accent" | "success" | "reserved" | "sold";
const BADGE_TONE: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-ink-600",
  brand: "bg-brand-tint text-brand-700",
  accent: "bg-accent-tint text-accent-700",
  success: "bg-success-tint text-success-600",
  reserved: "bg-reserved-tint text-reserved-600",
  sold: "bg-sold-tint text-sold-600",
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-2.5 py-1 text-[var(--text-2xs)] font-semibold uppercase tracking-[var(--tracking-wide)] ${BADGE_TONE[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status, className = "" }: { status: Listing["status"]; className?: string }) {
  const tone: BadgeTone =
    status === "active" ? "success" : status === "reserved" ? "reserved" : "sold";
  const dot =
    status === "active" ? "bg-success-500" : status === "reserved" ? "bg-reserved-600" : "bg-sold-600";
  return (
    <Badge tone={tone} className={className}>
      <span className={`size-1.5 rounded-full ${dot}`} aria-hidden />
      {STATUS_LABEL[status]}
    </Badge>
  );
}

/* -----------------------------------------------------------------------------
   PlateBadge — the signature: an authentic UK registration plate.
   -------------------------------------------------------------------------- */
export function PlateBadge({
  text,
  size = "md",
  className = "",
}: {
  text: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims =
    size === "lg"
      ? "h-9 text-[var(--text-lg)] px-3"
      : size === "sm"
        ? "h-6 text-[var(--text-xs)] px-2"
        : "h-7 text-[var(--text-base)] px-2.5";
  return (
    <span
      className={`inline-flex items-center rounded-[var(--radius-sm)] bg-plate font-mono font-bold tracking-[var(--tracking-plate)] text-plate-ink ring-2 ring-ink-900/85 ${dims} ${className}`}
      aria-label={`Registration plate ${text}`}
    >
      {text}
    </span>
  );
}

/* -----------------------------------------------------------------------------
   Price — mono, confident, with VAT qualifier.
   -------------------------------------------------------------------------- */
export function Price({
  listing,
  size = "md",
  className = "",
}: {
  listing: Pick<Listing, "price" | "price_type" | "vat_qualifying">;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const text =
    size === "lg" ? "text-[var(--text-3xl)]" : size === "sm" ? "text-[var(--text-lg)]" : "text-[var(--text-2xl)]";
  const poa = listing.price == null;
  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      <span className={`font-mono font-bold leading-none text-ink-900 ${text}`}>
        {formatPrice(listing.price)}
      </span>
      {!poa && (
        <span className="text-[var(--text-sm)] font-semibold text-ink-500">
          {vatLabel(listing.price_type, listing.vat_qualifying)}
        </span>
      )}
    </div>
  );
}
