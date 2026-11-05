"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Container } from "./ui";
import { Logo } from "./brand";
import { MobileNav } from "./mobile-nav";
import { POPULAR_MAKES } from "@/lib/taxonomy/van-makes";
import { SELL_URL } from "@/lib/site";

const VAN_BODY_TYPES = [
  { href: "/vans/panel-van",    label: "Panel vans" },
  { href: "/vans/luton",        label: "Luton vans" },
  { href: "/vans/tipper",       label: "Tippers" },
  { href: "/vans/dropside",     label: "Dropsides" },
  { href: "/vans/crew-van",     label: "Crew vans" },
  { href: "/vans/pickup",       label: "Pickups" },
  { href: "/vans/minibus",      label: "Minibuses" },
  { href: "/vans/chassis-cab",  label: "Chassis cabs" },
];



function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10" height="6" viewBox="0 0 10 6" fill="none"
      className={`mt-px shrink-0 text-ink-400 transition-transform duration-[var(--dur-base)] ${open ? "rotate-180 text-brand-500" : ""}`}
      aria-hidden
    >
      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const NAV_LINK_CLS =
  "flex shrink-0 items-center whitespace-nowrap px-3 text-[length:var(--text-sm)] font-semibold text-ink-600 transition-colors hover:text-ink-900 focus-visible:outline-none focus-visible:text-brand-600 lg:px-3.5 relative";

const DROP_ITEM_CLS =
  "block px-4 py-2.5 text-[length:var(--text-sm)] font-medium text-ink-700 hover:bg-surface-1 hover:text-brand-700 transition-colors duration-[var(--dur-fast)] rounded-[var(--radius-sm)]";

const GUIDES_ITEMS = [
  { href: "/blog",        label: "Guides & news" },
  { href: "/van-reviews", label: "Van reviews" },
  { href: "/new-vans",    label: "New van models" },
];

const FINANCE_ITEMS = [
  { href: "/van-finance",       label: "Van finance" },
  { href: "/van-contract-hire", label: "Van leasing" },
  { href: "/van-insurance",     label: "Insurance" },
];

type OpenId = "used" | "finance" | "guides" | null;

function NavDropdown({
  label,
  items,
  open,
  onToggle,
  onClose,
}: {
  id: string;
  label: string;
  items: { href: string; label: string }[];
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <div className="relative flex items-stretch" data-nav-menu>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={onToggle}
        className={`${NAV_LINK_CLS} gap-1.5 ${open ? "text-ink-900" : ""}`}
      >
        {label}
        <Chevron open={open} />
        {/* Active indicator bar */}
        {open && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-accent-500" />}
      </button>
      <div
        className="nav-drop absolute left-0 top-full z-50 min-w-[210px] rounded-[var(--radius-lg)] border border-border bg-white p-1.5 shadow-[var(--shadow-lg)]"
        data-open={open ? "true" : "false"}
      >
        {items.map((item) => (
          <Link key={item.href} href={item.href} className={DROP_ITEM_CLS} onClick={onClose}>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function VansForSaleDropdown({
  open,
  onToggle,
  onClose,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <div className="relative flex items-stretch" data-nav-menu>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={onToggle}
        className={`${NAV_LINK_CLS} gap-1.5 ${open ? "text-ink-900" : ""}`}
      >
        Buy a van
        <Chevron open={open} />
        {open && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-accent-500" />}
      </button>
      <div
        className="nav-drop absolute left-0 top-full z-50 w-[480px] rounded-[var(--radius-lg)] border border-border bg-white shadow-[var(--shadow-lg)]"
        data-open={open ? "true" : "false"}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <Link
            href="/vans"
            className="text-[length:var(--text-sm)] font-bold text-brand-600 hover:text-brand-700"
            onClick={onClose}
          >
            All vans for sale →
          </Link>
        </div>
        <div className="grid grid-cols-2 divide-x divide-border p-1">
          <div className="py-1.5 pr-1">
            <p className="px-3 pb-1.5 pt-2 text-[length:var(--text-2xs)] font-bold uppercase tracking-wider text-ink-400">
              By body type
            </p>
            {VAN_BODY_TYPES.map((item) => (
              <Link key={item.href} href={item.href} className={DROP_ITEM_CLS} onClick={onClose}>
                {item.label}
              </Link>
            ))}
          </div>
          <div className="py-1.5 pl-1">
            <p className="px-3 pb-1.5 pt-2 text-[length:var(--text-2xs)] font-bold uppercase tracking-wider text-ink-400">
              By make
            </p>
            {POPULAR_MAKES.map((m) => (
              <Link key={m.slug} href={`/vans/${m.slug}`} className={DROP_ITEM_CLS} onClick={onClose}>
                {m.name} vans for sale
              </Link>
            ))}
            <Link href="/vans" className={`${DROP_ITEM_CLS} mt-1 border-t border-border font-semibold text-brand-600 hover:text-brand-700`} onClick={onClose}>
              All makes →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const [openMenu, setOpenMenu] = useState<OpenId>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenMenu(null); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  function toggle(id: OpenId) {
    setOpenMenu((prev) => (prev === id ? null : id));
  }
  const close = () => setOpenMenu(null);

  return (
    <header ref={headerRef} className="sticky top-0 z-40 border-b border-border bg-white/97 backdrop-blur-md">
      {/* Top accent line — brand identity stripe */}
      <div className="h-0.5" style={{ background: "linear-gradient(to right, #1b5aa8, #f47c1e)" }} />

      <Container className="flex h-16 items-center gap-2">
        <Logo tone="dark" />

        {/* Primary nav (desktop) */}
        <nav className="ml-4 hidden h-full items-stretch md:flex" aria-label="Main">
          <VansForSaleDropdown open={openMenu === "used"} onToggle={() => toggle("used")} onClose={close} />
          <Link href="/vans?view=map" className={NAV_LINK_CLS} onClick={close}>Map</Link>
          <Link href="/dealers" className={NAV_LINK_CLS} onClick={close}>Dealers</Link>
          <NavDropdown id="finance" label="Finance" items={FINANCE_ITEMS} open={openMenu === "finance"} onToggle={() => toggle("finance")} onClose={close} />
          <NavDropdown id="guides" label="Blog" items={GUIDES_ITEMS} open={openMenu === "guides"} onToggle={() => toggle("guides")} onClose={close} />
        </nav>

        {/* Right: dealer login + sell */}
        <div className="ml-auto flex items-center gap-2">
          <a
            href="https://dealer.vansales.com/login"
            className="hidden rounded-[var(--radius-md)] border border-border-strong px-4 py-2 text-[length:var(--text-sm)] font-semibold text-ink-700 transition-colors hover:border-ink-400 hover:text-ink-900 md:inline-flex"
          >
            Dealer login
          </a>
          <a
            href={SELL_URL}
            className="hidden rounded-[var(--radius-md)] px-4 py-2 text-[length:var(--text-sm)] font-bold text-white shadow-[var(--shadow-xs)] transition-all hover:brightness-95 md:inline-flex"
            style={{ background: "linear-gradient(135deg, #f47c1e 0%, #d96410 100%)" }}
          >
            Sell your van
          </a>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
