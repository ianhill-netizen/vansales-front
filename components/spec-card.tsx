import type { Listing } from "@/lib/listings/types";

/* Per-make gradient — all stay within brand ink/blue palette so every card
   reads as intentional, not placeholder. Gradient direction is fixed; hue
   shifts subtly between makers for variety. */
const MAKE_GRADIENT: Record<string, string> = {
  Volkswagen:       "135deg, #0e2a6e 0%, #143a8c 100%",
  Ford:             "135deg, #0c1f42 0%, #163f7a 100%",
  "Mercedes-Benz":  "135deg, #0e1419 0%, #1c2a38 100%",
  Vauxhall:         "135deg, #1e0e3a 0%, #3a1f6e 100%",
  Renault:          "135deg, #0e1a2d 0%, #1a2d50 100%",
  Citroën:          "135deg, #0a2020 0%, #0f3030 100%",
  Toyota:           "135deg, #1a0a0a 0%, #2d1616 100%",
  Peugeot:          "135deg, #0e0e2a 0%, #1a1a4a 100%",
  Fiat:             "135deg, #1a0e28 0%, #2d1a46 100%",
  Nissan:           "135deg, #0a1820 0%, #162838 100%",
  Iveco:            "135deg, #0e1c2a 0%, #1a2c42 100%",
  MAN:              "135deg, #1a1a0e 0%, #2a2a18 100%",
  Maxus:            "135deg, #0e2018 0%, #143028 100%",
  Mitsubishi:       "135deg, #1a0e0e 0%, #2e1818 100%",
  Isuzu:            "135deg, #1a1000 0%, #2e2000 100%",
};
const DEFAULT_GRADIENT = "135deg, #0e2a6e 0%, #1a4ab0 100%";

function gradient(make: string): string {
  return MAKE_GRADIENT[make] ?? DEFAULT_GRADIENT;
}

/* Tiny inline icon — a van-body silhouette in pure strokes (NOT an illustration,
   just a geometric shape marker to break the pure-text composition). */
function BodyIcon({ bodyStyle }: { bodyStyle?: string }) {
  const bs = (bodyStyle ?? "").toLowerCase();
  if (bs.includes("pickup"))
    return (
      <svg width="36" height="20" viewBox="0 0 36 20" fill="none" aria-hidden>
        <rect x="1" y="9" width="14" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="15" y="12" width="19" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="28" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  if (bs.includes("luton"))
    return (
      <svg width="36" height="20" viewBox="0 0 36 20" fill="none" aria-hidden>
        <rect x="1" y="3" width="19" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="20" y="9" width="14" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="9" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="28" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  if (bs.includes("crew"))
    return (
      <svg width="36" height="20" viewBox="0 0 36 20" fill="none" aria-hidden>
        <rect x="1" y="6" width="33" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 6V3a1 1 0 011-1h22a1 1 0 011 1v3" stroke="currentColor" strokeWidth="1.5" />
        <line x1="18" y1="6" x2="18" y2="17" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
        <circle cx="9" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="27" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  if (bs.includes("drop"))
    return (
      <svg width="36" height="20" viewBox="0 0 36 20" fill="none" aria-hidden>
        <rect x="1" y="9" width="14" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <line x1="15" y1="13" x2="34" y2="13" stroke="currentColor" strokeWidth="1.5" />
        <line x1="20" y1="13" x2="20" y2="16" stroke="currentColor" strokeWidth="1.2" />
        <line x1="27" y1="13" x2="27" y2="16" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="8" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="28" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  /* Default — panel van */
  return (
    <svg width="36" height="20" viewBox="0 0 36 20" fill="none" aria-hidden>
      <rect x="1" y="6" width="33" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 6V4a1 1 0 011-1h18a1 1 0 011 1v2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="27" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/* ── Public API ─────────────────────────────────────────────────── */

export function SpecCard({
  listing,
  className = "",
}: {
  listing: Pick<Listing, "make" | "model" | "van_spec">;
  className?: string;
}) {
  const { make, model, van_spec } = listing;
  return (
    <div
      className={`relative flex flex-col justify-end p-5 text-white ${className}`}
      style={{ background: `linear-gradient(${gradient(make)})` }}
      role="img"
      aria-label={`${make} ${model} — photos coming soon`}
    >
      {/* Tag */}
      <span className="absolute right-3 top-3 rounded-[var(--radius-pill)] bg-white/10 px-2.5 py-0.5 text-[var(--text-2xs)] font-semibold uppercase tracking-[var(--tracking-wide)] text-white/60 backdrop-blur-sm">
        Photos coming soon
      </span>

      {/* Body icon */}
      <div className="mb-4 text-white/30">
        <BodyIcon bodyStyle={van_spec.body_style} />
      </div>

      {/* Make */}
      <p className="font-mono text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-white/45">
        {make}
      </p>

      {/* Model — display headline */}
      <p className="font-display text-[var(--text-2xl)] font-extrabold leading-tight tracking-[-0.025em] text-white">
        {model}
      </p>

      {/* Body style label */}
      {van_spec.body_style && (
        <span className="mt-2 inline-flex self-start rounded-[var(--radius-sm)] bg-white/10 px-2 py-0.5 text-[var(--text-xs)] text-white/55">
          {van_spec.body_style}
        </span>
      )}
    </div>
  );
}

/* Minimal variant for body-type browse tiles on homepage (no listing object) */
export function BodyTypeTile({
  label,
  href,
  gradient: gradientStr = DEFAULT_GRADIENT,
  className = "",
}: {
  label: string;
  href: string;
  gradient?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-end p-4 text-white ${className}`}
      style={{ background: `linear-gradient(${gradientStr})` }}
    >
      <span className="font-display text-[var(--text-base)] font-bold">{label}</span>
    </div>
  );
}
