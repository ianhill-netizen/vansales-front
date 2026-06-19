import Link from "next/link";
import { IconArrow } from "./icons";

/* Server-rendered pager. `hrefFor(page)` builds the URL (preserving filters);
   page 1 should omit the ?page param so it canonicalises cleanly. */
export function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  // Compact window: 1 … (p-1) p (p+1) … last
  const nums = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((n) => nums.add(n));
  if (page >= totalPages - 2) [totalPages - 1, totalPages - 2, totalPages - 3].forEach((n) => nums.add(n));
  const pages = [...nums].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);

  const base =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-[var(--radius-md)] px-3 text-[var(--text-sm)] font-semibold transition-colors";

  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        rel="prev"
        aria-label="Previous page"
        aria-disabled={page === 1}
        className={`${base} border border-border bg-surface-0 text-ink-700 hover:border-border-strong ${
          page === 1 ? "pointer-events-none opacity-40" : ""
        }`}
      >
        <IconArrow width={16} height={16} className="rotate-180" />
      </Link>

      {pages.map((n, i) => {
        const gap = i > 0 && n - pages[i - 1] > 1;
        return (
          <span key={n} className="flex items-center gap-1.5">
            {gap && <span className="px-1 text-ink-400">…</span>}
            {n === page ? (
              <span aria-current="page" className={`${base} bg-ink-900 text-white`}>
                {n}
              </span>
            ) : (
              <Link
                href={hrefFor(n)}
                className={`${base} border border-border bg-surface-0 text-ink-700 hover:border-border-strong`}
              >
                {n}
              </Link>
            )}
          </span>
        );
      })}

      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        rel="next"
        aria-label="Next page"
        aria-disabled={page === totalPages}
        className={`${base} border border-border bg-surface-0 text-ink-700 hover:border-border-strong ${
          page === totalPages ? "pointer-events-none opacity-40" : ""
        }`}
      >
        <IconArrow width={16} height={16} />
      </Link>
    </nav>
  );
}
