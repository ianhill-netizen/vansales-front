import Link from "next/link";
import { Container } from "./ui";
import { Logo } from "./brand";
import { MobileNav } from "./mobile-nav";
import { IconHeart } from "./icons";
import { AccountButton } from "./account-button";

const BODY_TYPES = [
  { href: "/vans/panel-van", label: "Panel vans" },
  { href: "/vans/luton", label: "Luton vans" },
  { href: "/vans/tipper", label: "Tippers" },
  { href: "/vans/dropside", label: "Dropsides" },
  { href: "/vans/crew-van", label: "Crew vans" },
  { href: "/vans/pickup", label: "Pickups" },
  { href: "/vans/minibus", label: "Minibuses" },
  { href: "/vans/chassis-cab", label: "Chassis cabs" },
];

const MAKES = [
  { href: "/vans/ford", label: "Ford" },
  { href: "/vans/volkswagen", label: "Volkswagen" },
  { href: "/vans/mercedes-benz", label: "Mercedes-Benz" },
  { href: "/vans/vauxhall", label: "Vauxhall" },
  { href: "/vans/renault", label: "Renault" },
  { href: "/vans/citroen", label: "Citroën" },
  { href: "/vans/peugeot", label: "Peugeot" },
  { href: "/vans/fiat", label: "Fiat" },
  { href: "/vans/nissan", label: "Nissan" },
  { href: "/vans/toyota", label: "Toyota" },
  { href: "/vans/iveco", label: "Iveco" },
];

const CONDITION = [
  { href: "/vans/new", label: "New vans" },
  { href: "/vans/used", label: "Used vans" },
  { href: "/vans/electric", label: "Electric vans" },
  { href: "/vans/ulez", label: "ULEZ-compliant" },
];

const FLAT_NAV = [
  { href: "/new-vans", label: "Model guide" },
  { href: "/van-finance", label: "Finance" },
  { href: "/blog", label: "Guides" },
  { href: "/advertise", label: "Advertise" },
];

function NavDropdown({ label, items }: { label: string; items: { href: string; label: string }[] }) {
  return (
    <div className="group relative flex items-stretch">
      <button
        type="button"
        className="flex shrink-0 items-center gap-1 whitespace-nowrap px-3 text-[var(--text-sm)] font-semibold text-ink-600 transition-colors hover:text-brand-600 lg:px-3.5"
      >
        {label}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="mt-0.5 opacity-50" aria-hidden="true">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="invisible absolute left-0 top-full z-50 min-w-[180px] rounded-[var(--radius-lg)] border border-border bg-white py-2 shadow-[var(--shadow-md)] group-hover:visible">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-4 py-2 text-[var(--text-sm)] font-medium text-ink-700 hover:bg-surface-1 hover:text-brand-600"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white">
      {/* ── Row 1: logo + utility actions ─────────────────────────── */}
      <Container className="flex h-14 items-center justify-between gap-4">
        <Logo tone="dark" />

        <div className="flex items-center gap-1">
          <Link
            href="/saved"
            className="hidden items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-sm)] font-semibold text-ink-600 transition-colors hover:bg-surface-2 hover:text-ink-900 sm:flex"
          >
            <IconHeart width={16} height={16} />
            Saved
          </Link>
          <AccountButton />
          <MobileNav />
        </div>
      </Container>

      {/* ── Row 2: primary nav (desktop only) ─────────────────────── */}
      <div className="hidden border-t border-border md:block">
        <Container className="flex h-11 items-stretch">
          <NavDropdown label="Body type" items={BODY_TYPES} />
          <NavDropdown label="By make" items={MAKES} />
          <NavDropdown label="New & used" items={CONDITION} />
          {FLAT_NAV.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex shrink-0 items-center whitespace-nowrap px-3 text-[var(--text-sm)] font-semibold text-ink-600 transition-colors hover:text-brand-600 lg:px-3.5"
            >
              {l.label}
            </Link>
          ))}
        </Container>
      </div>
    </header>
  );
}
