import Link from "next/link";

export interface InternalLink { href: string; label: string }

/** A plain text-link block for the SEO link network: just anchors with descriptive text, in columns. No cards, no images. */
export function InternalLinks({
  title,
  links,
  id,
  columns = 3,
  className = "",
}: {
  title: string;
  links: InternalLink[];
  id?: string;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  if (links.length === 0) return null;
  const cols = columns === 4 ? "sm:columns-2 lg:columns-4" : columns === 3 ? "sm:columns-2 lg:columns-3" : "sm:columns-2";
  const heading = id ?? `links-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section aria-labelledby={heading} className={className}>
      <h2 id={heading} className="font-display text-[length:var(--text-lg)] font-bold text-ink-900">{title}</h2>
      <ul className={`mt-3 ${cols} gap-x-8 text-[length:var(--text-sm)]`}>
        {links.map((l) => (
          <li key={l.href + l.label} className="break-inside-avoid py-1">
            <Link href={l.href} className="text-brand-700 hover:underline">{l.label}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
