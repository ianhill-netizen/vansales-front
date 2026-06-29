import Link from "next/link";
import { Container } from "./ui";
import { Logo } from "./brand";
import { SITE } from "@/lib/site";

const COLS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Browse stock",
    links: [
      { href: "/vans/panel-van", label: "Panel vans for sale" },
      { href: "/vans/luton",     label: "Luton vans" },
      { href: "/vans/tipper",    label: "Tippers & dropsides" },
      { href: "/vans/crew-van",  label: "Crew vans" },
      { href: "/vans/pickup",    label: "Pickup trucks" },
      { href: "/vans/electric",  label: "Electric vans" },
    ],
  },
  {
    title: "Popular models",
    links: [
      { href: "/vans/volkswagen/transporter", label: "VW Transporter" },
      { href: "/vans/ford/transit-custom",    label: "Ford Transit Custom" },
      { href: "/vans/ford/transit",           label: "Ford Transit" },
      { href: "/vans/mercedes-benz/sprinter", label: "Mercedes Sprinter" },
      { href: "/vans/vauxhall/vivaro",        label: "Vauxhall Vivaro" },
      { href: "/new-vans",                     label: "New van model guides" },
      { href: "/directory",                   label: "All makes A–Z" },
    ],
  },
  {
    title: "Vansales",
    links: [
      { href: "/sell",              label: "Advertise your van" },
      { href: "/van-finance",       label: "Van finance" },
      { href: "/van-insurance",     label: "Van insurance" },
      { href: "/van-contract-hire", label: "Van leasing" },
      { href: "/van-reviews",       label: "Van reviews" },
      { href: "/blog",              label: "Guides & news" },
      { href: "/dealer-portal",     label: "Dealer portal" },
      { href: "/signup/trade",       label: "List my stock free" },
      { href: "/signup/advertise",   label: "Advertise with us" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-[var(--section-y)] bg-ink-900 text-white">

      {/* Brand statement strip */}
      <div className="border-b border-ink-800">
        <Container className="flex flex-col items-start justify-between gap-6 py-12 sm:flex-row sm:items-center">
          <div>
            <Logo tone="light" />
            <p className="mt-4 max-w-sm text-[var(--text-base)] leading-relaxed text-ink-400">
              The UK&rsquo;s straight-talking van marketplace — spec-first search from verified dealers.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:items-end">
            <a
              href={`tel:${SITE.phone.replace(/[^\d+]/g, "")}`}
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-ink-700 px-4 py-2.5 text-[var(--text-sm)] font-semibold text-ink-300 transition-colors hover:border-ink-500 hover:text-white"
            >
              {SITE.phone}
            </a>
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2.5 text-[var(--text-sm)] font-bold text-white"
              style={{ background: "linear-gradient(135deg, #f47c1e 0%, #d96410 100%)" }}
            >
              Advertise your van →
            </Link>
          </div>
        </Container>
      </div>

      {/* Link columns */}
      <Container className="grid gap-10 py-12 md:grid-cols-[1.2fr_repeat(3,1fr)]">
        {/* SEO text column */}
        <div>
          <p className="text-[var(--text-sm)] leading-relaxed text-ink-500">
            Vansales brings together thousands of used and new vans for sale from verified UK
            dealers. Filter by payload, wheelbase, ULEZ compliance and Euro 6 status to find
            the van that fits the job.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              { href: "/vans/ford",          label: "Ford" },
              { href: "/vans/volkswagen",    label: "Volkswagen" },
              { href: "/vans/mercedes-benz", label: "Mercedes" },
              { href: "/vans/vauxhall",      label: "Vauxhall" },
              { href: "/vans/renault",       label: "Renault" },
              { href: "/vans/citroen",       label: "Citroën" },
            ].map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className="rounded-[var(--radius-sm)] border border-ink-800 px-2.5 py-1 text-[var(--text-xs)] font-semibold text-ink-500 transition-colors hover:border-ink-600 hover:text-ink-300"
              >
                {m.label}
              </Link>
            ))}
          </div>
        </div>

        {COLS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="font-mono text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-500">
              {col.title}
            </h2>
            <ul className="mt-5 space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[var(--text-sm)] text-ink-400 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>

      {/* Bottom bar */}
      <div className="border-t border-ink-800">
        <Container className="flex flex-col gap-2 py-5 text-[var(--text-xs)] text-ink-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. Concept marketplace — listings are demonstration data.</p>
          <p className="font-mono tracking-[var(--tracking-wide)]">
            {SITE.domain}
          </p>
        </Container>
      </div>
    </footer>
  );
}
