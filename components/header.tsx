import Link from "next/link";
import { Container, Button } from "./ui";
import { Logo } from "./brand";
import { MobileNav } from "./mobile-nav";
import { IconSearch } from "./icons";

const NAV = [
  { href: "/vans/volkswagen/transporter", label: "VW Transporter" },
  { href: "/vans/ford/transit-custom", label: "Transit Custom" },
  { href: "/#browse", label: "Browse by type" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-900 text-white">
      <Container className="relative flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo tone="light" />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-sm)] font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/vans/volkswagen/transporter"
            className="hidden size-10 items-center justify-center rounded-[var(--radius-md)] text-white/80 hover:bg-white/10 hover:text-white sm:inline-flex"
            aria-label="Search vans"
          >
            <IconSearch />
          </Link>
          <Button href="/#sell" variant="primary" size="sm" className="hidden sm:inline-flex">
            Sell your van
          </Button>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
