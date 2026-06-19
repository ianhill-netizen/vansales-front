import Link from "next/link";
import { Container, Button } from "./ui";
import { Logo } from "./brand";
import { MobileNav } from "./mobile-nav";

const NAV = [
  { href: "/vans/volkswagen/transporter", label: "VW Transporter" },
  { href: "/vans/ford/transit-custom", label: "Transit Custom" },
  { href: "/#browse", label: "Browse by type" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur-sm">
      <Container className="relative flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo tone="dark" />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-sm)] font-semibold text-ink-600 transition-colors hover:bg-surface-2 hover:text-ink-900"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button href="/#sell" variant="primary" size="sm" className="hidden sm:inline-flex">
            Advertise your van
          </Button>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
