import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";
import { getModelIndex } from "@/lib/listings/client";
import { slugify } from "@/lib/listings/slug";
import { SITE } from "@/lib/site";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Van Directory — All Makes & Models",
  description: `A–Z directory of every van make and model in the ${SITE.name} catalogue. Find the right van type and jump straight to the listings.`,
};

export default async function DirectoryPage() {
  const index = await getModelIndex();

  /* Group by first letter of make */
  const byLetter: Record<string, typeof index> = {};
  for (const entry of index) {
    const letter = entry.make[0]?.toUpperCase() ?? "#";
    (byLetter[letter] ??= []).push(entry);
  }
  const letters = Object.keys(byLetter).sort();

  /* Group by make for a nested display */
  const byMake: Record<string, typeof index> = {};
  for (const entry of index) {
    (byMake[entry.make] ??= []).push(entry);
  }

  return (
    <>
      <section className="border-b border-border bg-surface-1">
        <Container className="py-10">
          <Eyebrow>Van Directory</Eyebrow>
          <h1 className="mt-2 font-display text-[var(--text-3xl)] font-extrabold leading-tight text-ink-900">
            All makes &amp; models
          </h1>
          <p className="mt-3 max-w-xl text-[var(--text-md)] text-ink-600">
            Browse every make and model currently in the Vansales catalogue. Tap any model to see
            available stock, specs and pricing.
          </p>
          {/* Letter jump nav */}
          <div className="mt-5 flex flex-wrap gap-1.5">
            {letters.map((l) => (
              <a
                key={l}
                href={`#letter-${l}`}
                className="flex size-9 items-center justify-center rounded-[var(--radius-md)] border border-border bg-white font-mono text-[var(--text-sm)] font-bold text-ink-700 transition-colors hover:border-brand-500 hover:text-brand-600"
              >
                {l}
              </a>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-10">
        <div className="space-y-12">
          {letters.map((letter) => (
            <div key={letter} id={`letter-${letter}`} className="scroll-mt-24">
              <h2 className="mb-4 font-display text-[var(--text-2xl)] font-extrabold text-ink-900">
                {letter}
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {/* Unique makes under this letter */}
                {[...new Map(byLetter[letter].map((e) => [e.make, e])).values()].map((makeEntry) => (
                  <div
                    key={makeEntry.make}
                    className="rounded-[var(--radius-lg)] border border-border bg-white p-4 shadow-[var(--shadow-xs)]"
                  >
                    <Link
                      href={`/vans/${slugify(makeEntry.make)}`}
                      className="block font-display text-[var(--text-base)] font-extrabold text-ink-900 hover:text-brand-600"
                    >
                      {makeEntry.make}
                    </Link>
                    <ul className="mt-2 space-y-1">
                      {(byMake[makeEntry.make] ?? []).map((entry) => (
                        <li key={`${entry.make}/${entry.model}`}>
                          <Link
                            href={`/vans/${slugify(entry.make)}/${slugify(entry.model)}`}
                            className="flex items-center justify-between text-[var(--text-sm)] text-ink-600 hover:text-brand-600"
                          >
                            <span>{entry.model}</span>
                            <span className="rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[var(--text-xs)] text-ink-400">
                              {entry.count}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/vans/${slugify(makeEntry.make)}`}
                      className="mt-3 block text-[var(--text-xs)] font-semibold text-brand-600 hover:underline"
                    >
                      All {makeEntry.make} vans →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
