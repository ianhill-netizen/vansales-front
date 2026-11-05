/** A dealer's logo as a rounded square (object-contain on white, with a border), or their initials on a brand-colour tile when there is no logo. */
export function dealerInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => (w[0] ?? "").toUpperCase()).join("");
}

export function DealerLogo({ name, logoUrl, size = 72, className = "", decorative = false }: { name: string; logoUrl?: string | null; size?: number; className?: string; decorative?: boolean }) {
  const box = { width: size, height: size };
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={decorative ? "" : `${name} logo`}
        width={size}
        height={size}
        loading="lazy"
        style={box}
        className={`shrink-0 rounded-xl border border-border bg-white object-contain p-1 ${className}`}
      />
    );
  }
  return (
    <span
      aria-hidden
      style={{ ...box, fontSize: Math.round(size * 0.34) }}
      className={`grid shrink-0 place-items-center rounded-xl bg-brand-600 font-display font-extrabold text-white ${className}`}
    >
      {dealerInitials(name)}
    </span>
  );
}
