import Link from "next/link";
import { Container } from "./ui";
import { Logo } from "./brand";
import { SITE } from "@/lib/site";

const COLS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Popular models",
    links: [
      { href: "/vans/volkswagen/transporter", label: "VW Transporter" },
      { href: "/vans/ford/transit-custom", label: "Ford Transit Custom" },
      { href: "/vans/ford/transit", label: "Ford Transit" },
      { href: "/vans/mercedes-benz/sprinter", label: "Mercedes Sprinter" },
    ],
  },
  {
    title: "By body type",
    links: [
      { href: "/#browse", label: "Panel vans" },
      { href: "/#browse", label: "Dropsides & tippers" },
      { href: "/#browse", label: "Luton & box vans" },
      { href: "/#browse", label: "Crew cabs & pickups" },
    ],
  },
  {
    title: "Vansales",
    links: [
      { href: "/#sell", label: "Sell your van" },
      { href: "/#", label: "Van finance" },
      { href: "/#", label: "Dealer reviews" },
      { href: "/#", label: "Buying guides" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-[var(--section-y)] border-t border-white/10 bg-ink-900 text-white/70">
      <Container className="grid gap-10 py-12 md:grid-cols-[1.2fr_repeat(3,1fr)]">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-[var(--text-sm)] leading-relaxed text-white/60">
            {SITE.tagline}. Compare vans from trusted UK dealers and private sellers by the
            numbers that matter on the job.
          </p>
        </div>
        {COLS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="font-display text-[var(--text-sm)] font-bold uppercase tracking-[var(--tracking-wide)] text-white">
              {col.title}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[var(--text-sm)] text-white/65 hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-5 text-[var(--text-xs)] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {SITE.name}.com — concept marketplace. Listings shown are demonstration data.</p>
          <p className="font-mono tracking-[var(--tracking-wide)]">Built mobile-first · {SITE.domain}</p>
        </Container>
      </div>
    </footer>
  );
}
