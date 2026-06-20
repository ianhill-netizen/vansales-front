import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { Listing } from "@/lib/listings/types";
import { formatPrice, vatLabel, STATUS_LABEL } from "@/lib/listings/format";

/* ── Layout ─────────────────────────────────────────────────────────────────── */
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
    size === "wide"   ? "max-w-[var(--container-wide)]"
    : size === "narrow" ? "max-w-[760px]"
    : "max-w-[var(--container-max)]";
  return (
    <div className={`mx-auto w-full ${max} px-[var(--gutter)] ${className}`}>
      {children}
    </div>
  );
}

export function Eyebrow({
  children,
  className = "",
  light = false,
}: {
  children: ReactNode;
  className?: string;
  light?: boolean;
}) {
  return (
    <p className={`eyebrow ${light ? "!text-white/50" : ""} ${className}`}>
      {children}
    </p>
  );
}

/* ── Button ──────────────────────────────────────────────────────────────────
   Variants: primary (orange), brand (navy), dark, ghost, outline, outline-light.
   Renders as <Link> when href is provided, otherwise <button>.
   ──────────────────────────────────────────────────────────────────────────── */
type ButtonVariant = "primary" | "brand" | "accent" | "dark" | "ghost" | "outline" | "outline-light";
type ButtonSize = "sm" | "md" | "lg";

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--radius-md)] transition-all duration-[var(--dur-base)] ease-[var(--ease-out)] active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none";

const BTN_VARIANT: Record<ButtonVariant, string> = {
  primary:
    "text-white shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] focus-visible:ring-accent-500 hover:brightness-105",
  brand:
    "text-white shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] focus-visible:ring-brand-500 hover:brightness-110",
  accent:
    "text-white shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] focus-visible:ring-accent-500 hover:brightness-105",
  dark:
    "bg-ink-900 text-white hover:bg-ink-800 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] focus-visible:ring-ink-700",
  ghost:
    "bg-transparent text-ink-700 hover:bg-surface-2 focus-visible:ring-brand-500",
  outline:
    "bg-surface-0 text-ink-800 border border-border-strong hover:border-ink-400 hover:bg-surface-1 focus-visible:ring-brand-500",
  "outline-light":
    "bg-transparent text-white border border-white/30 hover:border-white/70 hover:bg-white/10 focus-visible:ring-white",
};

const BTN_GRADIENT: Record<ButtonVariant, string> = {
  primary:       "background: var(--gradient-accent-btn)",
  brand:         "background: var(--gradient-brand-btn)",
  accent:        "background: var(--gradient-accent-btn)",
  dark:          "",
  ghost:         "",
  outline:       "",
  "outline-light": "",
};

const BTN_SIZE: Record<ButtonSize, string> = {
  sm: "text-[var(--text-sm)] h-9 px-4",
  md: "text-[var(--text-base)] h-11 px-5",
  lg: "text-[var(--text-md)] px-7 py-3.5",
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
  style,
  ...rest
}: ButtonProps & { style?: React.CSSProperties }) {
  const variantStyle =
    variant === "primary" || variant === "brand" || variant === "accent"
      ? { background: variant === "brand" ? "linear-gradient(135deg, #1b5aa8 0%, #0d2d5a 100%)" : "linear-gradient(135deg, #f47c1e 0%, #d96410 100%)", ...style }
      : style;

  const cls = `${BTN_BASE} ${BTN_VARIANT[variant]} ${BTN_SIZE[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={cls} style={variantStyle}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} style={variantStyle} {...rest}>
      {children}
    </button>
  );
}

/* ── Input ───────────────────────────────────────────────────────────────────
   Standard text input with optional label. Accessible, focus-ringed.
   ──────────────────────────────────────────────────────────────────────────── */
type InputProps = {
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
} & Omit<ComponentProps<"input">, "ref">;

export function Input({ label, hint, error, className = "", id, ...rest }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-ink-500">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`h-11 w-full rounded-[var(--radius-md)] border bg-surface-0 px-3.5 text-[var(--text-base)] font-medium text-ink-800 placeholder:text-ink-400 outline-none transition-colors duration-[var(--dur-fast)] ${
          error
            ? "border-danger-500 focus-visible:border-danger-500 focus-visible:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]"
            : "border-border focus-visible:border-brand-500 focus-visible:shadow-[var(--shadow-focus)]"
        }`}
        {...rest}
      />
      {(hint || error) && (
        <p className={`text-[var(--text-xs)] ${error ? "text-danger-600" : "text-ink-500"}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

/* ── Select ──────────────────────────────────────────────────────────────────
   Styled native select.
   ──────────────────────────────────────────────────────────────────────────── */
type SelectProps = {
  label?: string;
  hint?: string;
  className?: string;
  options: { value: string; label: string }[];
} & Omit<ComponentProps<"select">, "ref">;

export function Select({ label, hint, className = "", options, id, ...rest }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-ink-500">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className="h-11 w-full appearance-none rounded-[var(--radius-md)] border border-border bg-surface-0 pl-3.5 pr-8 text-[var(--text-base)] font-medium text-ink-800 outline-none transition-colors duration-[var(--dur-fast)] focus-visible:border-brand-500 focus-visible:shadow-[var(--shadow-focus)] cursor-pointer"
          {...rest}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
      {hint && <p className="text-[var(--text-xs)] text-ink-500">{hint}</p>}
    </div>
  );
}

/* ── Badge + StatusBadge ─────────────────────────────────────────────────────
   Pill-style labels for conditions, dealer type, fuel type, status.
   ──────────────────────────────────────────────────────────────────────────── */
type BadgeTone = "neutral" | "brand" | "accent" | "success" | "reserved" | "sold" | "featured" | "warning";
const BADGE_TONE: Record<BadgeTone, string> = {
  neutral:  "bg-surface-2 text-ink-600",
  brand:    "bg-brand-tint text-brand-700",
  accent:   "bg-accent-tint text-accent-700",
  success:  "bg-success-tint text-success-700",
  reserved: "bg-reserved-tint text-reserved-600",
  sold:     "bg-sold-tint text-sold-600",
  featured: "bg-amber-100 text-amber-800 border border-amber-200",
  warning:  "bg-warning-tint text-warning-600",
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

/* ── PlateBadge ──────────────────────────────────────────────────────────────
   Authentic UK registration plate treatment.
   ──────────────────────────────────────────────────────────────────────────── */
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

/* ── Price ───────────────────────────────────────────────────────────────────
   Monospaced, confident price display with VAT qualifier.
   ──────────────────────────────────────────────────────────────────────────── */
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
    size === "lg"
      ? "text-[var(--text-3xl)]"
      : size === "sm"
        ? "text-[var(--text-lg)]"
        : "text-[var(--text-2xl)]";
  const poa = listing.price == null;
  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      <span className={`font-mono font-bold leading-none text-ink-900 ${text}`}>
        {formatPrice(listing.price)}
      </span>
      {!poa && (
        <span className="text-[var(--text-xs)] font-medium text-ink-500">
          {vatLabel(listing.price_type, listing.vat_qualifying)}
        </span>
      )}
    </div>
  );
}

/* ── SectionHeader ───────────────────────────────────────────────────────────
   Eyebrow + h2 pairing used on most content sections.
   ──────────────────────────────────────────────────────────────────────────── */
export function SectionHeader({
  eyebrow,
  heading,
  sub,
  centered = false,
  light = false,
  className = "",
}: {
  eyebrow?: string;
  heading: ReactNode;
  sub?: ReactNode;
  centered?: boolean;
  light?: boolean;
  className?: string;
}) {
  return (
    <div className={`${centered ? "text-center" : ""} ${className}`}>
      {eyebrow && <Eyebrow light={light}>{eyebrow}</Eyebrow>}
      <h2
        className={`mt-2 font-display text-[var(--text-2xl)] font-extrabold leading-[1.1] tracking-[var(--tracking-display)] ${light ? "text-white" : "text-ink-900"}`}
      >
        {heading}
      </h2>
      {sub && (
        <p className={`mt-2 text-[var(--text-md)] leading-relaxed ${light ? "text-white/65" : "text-ink-500"}`}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ── Divider ─────────────────────────────────────────────────────────────────*/
export function Divider({ className = "" }: { className?: string }) {
  return <hr className={`border-border ${className}`} />;
}
