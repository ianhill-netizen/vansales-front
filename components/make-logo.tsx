/* =============================================================================
   MakeLogo — a make's logo (from /public/logos, Wikimedia Commons, see
   LICENCES.md) or, when we have no suitably licensed file, a neutral monogram.
   Decorative: it always sits next to the make's name, so alt="".
   Greyscale + slightly faded by default; full colour when the parent pill
   (class "group") is hovered or focused. Trademarks are shown only to
   identify makes of vans for sale.
   ============================================================================= */

/** slug → intrinsic width / height of the SVG viewBox. Makes not listed fall back to the monogram. */
const LOGO_RATIO: Record<string, number> = {
  ford: 264.58 / 95.23,
  volkswagen: 1,
  "mercedes-benz": 355 / 350,
  vauxhall: 112 / 108,
  citroen: 510 / 700,
  peugeot: 543 / 47,
  renault: 954 / 1255,
  fiat: 555.61 / 420.7,
  toyota: 251.35 / 136,
  nissan: 264.58 / 221.38,
  iveco: 168.93 / 37.22,
  maxus: 2548.98 / 520,
  isuzu: 1000 / 171.8,
  mitsubishi: 205.93 / 190,
};

export function hasMakeLogo(slug: string): boolean {
  return slug in LOGO_RATIO;
}

function slugOf(make: string): string {
  return make.normalize("NFD").replace(/\p{Mn}/gu, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function initials(make: string): string {
  const words = make.replace(/[-_]+/g, " ").trim().split(/\s+/);
  if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase();
  return make.length <= 3 ? make.toUpperCase() : make.slice(0, 1).toUpperCase();
}

export function MakeLogo({
  make,
  name,
  size = 24,
  className = "",
  bare = false,
  colour = false,
}: {
  /** Make slug ("mercedes-benz") or display name ("Citroën"). */
  make: string;
  /** Display name, used for the monogram initials (defaults to `make`). */
  name?: string;
  /** Height in px. Wide wordmarks are capped at about twice the height. */
  size?: number;
  className?: string;
  /** No white tile behind the logo (use on light backgrounds where the tile would be redundant). */
  bare?: boolean;
  /** Always full colour (page headings), instead of greyscale until hovered. */
  colour?: boolean;
}) {
  const slug = slugOf(make);
  const ratio = LOGO_RATIO[slug];
  const tile = bare ? "" : "rounded-[6px] bg-white p-[3px] ring-1 ring-black/5";
  const inner = Math.max(size - (bare ? 0 : 6), 8);
  if (ratio) {
    const w = Math.round(Math.min(ratio, 2.2) * inner);
    return (
      <span aria-hidden className={`inline-flex shrink-0 items-center justify-center ${tile} ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/logos/${slug}.svg`}
          alt=""
          width={w}
          height={inner}
          loading="lazy"
          decoding="async"
          className={`object-contain transition ${colour ? "" : "opacity-70 grayscale"}  duration-150 group-hover:opacity-100 group-hover:grayscale-0 group-focus-visible:opacity-100 group-focus-visible:grayscale-0 group-focus-within:opacity-100 group-focus-within:grayscale-0`}
          style={{ width: w, height: inner }}
        />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={`inline-grid shrink-0 place-items-center rounded-[6px] bg-surface-2 font-display font-bold text-ink-500 ring-1 ring-black/5 ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      {initials(name ?? make)}
    </span>
  );
}
