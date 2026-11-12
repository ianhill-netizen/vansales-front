import Link from "next/link";

export interface ContentLink {
  href: string;
  label: string;
}

/** A plain list of crawlable links under a heading. Renders nothing for an empty list. */
export function ContentLinks({ title, links, className = "" }: { title: string; links: ContentLink[]; className?: string }) {
  if (links.length === 0) return null;
  return (
    <section className={className}>
      <h2 className="font-display text-[length:var(--text-xl)] font-bold text-ink-900">{title}</h2>
      <ul className="mt-3 space-y-1.5">
        {links.map((l) => (
          <li key={l.href}><Link href={l.href} className="text-[length:var(--text-md)] text-brand-700 hover:underline">{l.label}</Link></li>
        ))}
      </ul>
    </section>
  );
}

/** Previous / next article links for a post, in publication order. */
export function PrevNext({ newer, older, base, newerLabel = "Newer", olderLabel = "Older" }: { newer: { slug: string; title: string } | null; older: { slug: string; title: string } | null; base: string; newerLabel?: string; olderLabel?: string }) {
  if (!newer && !older) return null;
  return (
    <nav aria-label="More articles" className="mt-10 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
      {older ? (
        <Link href={`${base}/${older.slug}`} rel="prev" className="group block rounded-[var(--radius-lg)] border border-border p-4 hover:border-brand-700">
          <span className="text-[length:var(--text-xs)] font-semibold uppercase tracking-wide text-ink-400">← {olderLabel}</span>
          <span className="mt-1 block font-semibold text-ink-900 group-hover:text-brand-700">{older.title}</span>
        </Link>
      ) : <span />}
      {newer ? (
        <Link href={`${base}/${newer.slug}`} rel="next" className="group block rounded-[var(--radius-lg)] border border-border p-4 text-right hover:border-brand-700">
          <span className="text-[length:var(--text-xs)] font-semibold uppercase tracking-wide text-ink-400">{newerLabel} →</span>
          <span className="mt-1 block font-semibold text-ink-900 group-hover:text-brand-700">{newer.title}</span>
        </Link>
      ) : <span />}
    </nav>
  );
}
