import Link from "next/link";
import { Container } from "./ui";
import { Logo } from "./brand";
import { MobileNav } from "./mobile-nav";
import { IconHeart } from "./icons";
import { AccountButton } from "./account-button";

/* =============================================================================
   NAV_TOP_LEVEL_LOCK — exactly 8 items, in this order. Do NOT add to or
   reorder this list without a product decision. Body-type and make sub-pages
   live as dropdown items under "Used vans" / "New vans" — they must NOT
   appear here as separate top-level entries.
   ========================================================================== */
const USED_VAN_BODY_TYPES = [
  { href: "/vans/panel-van", label: "Panel vans" },
  { href: "/vans/luton", label: "Luton vans" },
  { href: "/vans/tipper", label: "Tippers" },
  { href: "/vans/dropside", label: "Dropsides" },
  { href: "/vans/crew-van", label: "Crew vans" },
  { href: "/vans/pickup", label: "Pickups" },
  { href: "/vans/minibus", label: "Minibuses" },
  { href: "/vans/chassis-cab", label: "Chassis cabs" },
];

const USED_VAN_MAKES = [
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

const NEW_VAN_ITEMS = [
  { href: "/vans/new", label: "All new vans" },
  { href: "/new-vans", label: "New van model guide" },
  { href: "/vans/ulez", label: "ULEZ-compliant" },
];

const SELL_ITEMS = [
  { href: "/sell", label: "Advertise your van" },
  { href: "/sign-up/dealer", label: "List as a dealer" },
  { href: "/sign-up/private-seller", label: "Private seller listing" },
];

const CHEVRON = (
  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="mt-0.5 opacity-50" aria-hidden>
    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NAV_LINK_CLS = "flex shrink-0 items-center whitespace-nowrap px-3 text-[var(--text-sm)] font-semibold text-ink-600 transition-colors hover:text-brand-600 lg:px-3.5";
const DROP_ITEM_CLS = "block px-4 py-2 text-[var(--text-sm)] font-medium text-ink-700 hover:bg-surface-1 hover:text-brand-600";

/** Simple single-column dropdown. */
function NavDropdown({ label, items }: { label: string; items: { href: string; label: string }[] }) {
  return (
    <div className="group relative flex items-stretch">
      <button type="button" className={`${NAV_LINK_CLS} gap-1`}>
        {label}{CHEVRON}
      </button>
      <div className="invisible absolute left-0 top-full z-50 min-w-[200px] rounded-[var(--radius-lg)] border border-border bg-white py-2 shadow-[var(--shadow-md)] group-hover:visible">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className={DROP_ITEM_CLS}>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/** Wide 2-column dropdown — body types on left, makes on right. */
function UsedVansDropdown() {
  return (
    <div className="group relative flex items-stretch">
      <button type="button" className={`${NAV_LINK_CLS} gap-1`}>
        Used vans{CHEVRON}
      </button>
      <div className="invisible absolute left-0 top-full z-50 rounded-[var(--radius-lg)] border border-border bg-white shadow-[var(--shadow-md)] group-hover:visible">
        <div className="border-b border-border px-4 py-2">
          <Link href="/vans/used" className="text-[var(--text-sm)] font-bold text-brand-600 hover:underline">
            All used vans →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-0 divide-x divide-border">
          <div className="py-2">
            <p className="px-4 pb-1 pt-2 text-[var(--text-2xs)] font-bold uppercase tracking-wider text-ink-400">By body type</p>
            {USED_VAN_BODY_TYPES.map((item) => (
              <Link key={item.href} href={item.href} className={DROP_ITEM_CLS}>{item.label}</Link>
            ))}
          </div>
          <div className="py-2">
            <p className="px-4 pb-1 pt-2 text-[var(--text-2xs)] font-bold uppercase tracking-wider text-ink-400">By make</p>
            {USED_VAN_MAKES.map((item) => (
              <Link key={item.href} href={item.href} className={DROP_ITEM_CLS}>{item.label}</Link>
            ))}
          </div>
        </div>
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

      {/* ── Row 2: NAV_TOP_LEVEL_LOCK — 8 items, do not alter (see comment above) ── */}
      <div className="hidden border-t border-border md:block">
        <Container className="flex h-11 items-stretch">
          <UsedVansDropdown />
          <NavDropdown label="New vans" items={NEW_VAN_ITEMS} />
          <NavDropdown label="Sell your van" items={SELL_ITEMS} />
          <Link href="/van-reviews" className={NAV_LINK_CLS}>Van reviews</Link>
          <Link href="/van-contract-hire" className={NAV_LINK_CLS}>Van leasing</Link>
          <Link href="/van-finance" className={NAV_LINK_CLS}>Finance</Link>
          <Link href="/vans/electric" className={NAV_LINK_CLS}>Electric vans</Link>
          <Link href="/van-insurance" className={NAV_LINK_CLS}>Insurance</Link>
        </Container>
      </div>
    </header>
  );
}
