import Link from "next/link";

export interface RelatedLink {
  href: string;
  label: string;
}

interface Props {
  title: string;
  links: RelatedLink[];
  /** "pills" = horizontal chip row; "list" = vertical link list (default) */
  variant?: "pills" | "list";
  className?: string;
}

export function RelatedLinks({ title, links, variant = "list", className = "" }: Props) {
  if (!links.length) return null;
  return (
    <div className={className}>
      <h3 className="mb-3 font-display text-[var(--text-base)] font-bold text-ink-900">{title}</h3>
      {variant === "pills" ? (
        <div className="flex flex-wrap gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-[var(--radius-pill)] border border-border bg-white px-4 py-1.5 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400 hover:text-brand-600"
            >
              {l.label}
            </Link>
          ))}
        </div>
      ) : (
        <ul className="space-y-1.5">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-[var(--text-sm)] text-brand-700 hover:underline">
                {l.label} →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
