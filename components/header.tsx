import Link from "next/link";
import { Container } from "./ui";
import { Logo } from "./brand";
import { MobileNav } from "./mobile-nav";
import { IconHeart } from "./icons";
import { AccountButton } from "./account-button";

const PRIMARY_NAV = [
  { href: "/vans?condition=new", label: "New vans" },
  { href: "/vans?condition=used", label: "Used vans" },
  { href: "/vans/panel-van", label: "Panel vans" },
  { href: "/vans/luton", label: "Luton vans" },
  { href: "/vans/tipper", label: "Tippers" },
  { href: "/vans/dropside", label: "Dropsides" },
  { href: "/vans/minibus", label: "Minibuses" },
  { href: "/vans/electric", label: "Electric" },
  { href: "/new-vans", label: "Model guide" },
  { href: "/blog", label: "Guides" },
  { href: "/van-finance", label: "Finance" },
  { href: "/advertise", label: "Advertise" },
];

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
          {PRIMARY_NAV.map((l) => (
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
