"use client";

import { makeVansPath } from "@/lib/seo/make-url";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { POPULAR_MAKES } from "@/lib/taxonomy/van-makes";
import { SELL_URL } from "@/lib/site";
import { Logo } from "./brand";

const BODY_TYPE_LINKS = [
  { href: "/vans", label: "All vans for sale" },
  { href: "/vans/panel-van", label: "Panel vans" },
  { href: "/vans/luton", label: "Luton vans" },
  { href: "/vans/tipper", label: "Tippers" },
  { href: "/vans/dropside", label: "Dropsides" },
  { href: "/vans/crew-van", label: "Crew vans" },
  { href: "/vans/pickup", label: "Pickups" },
  { href: "/vans/minibus", label: "Minibuses" },
  { href: "/vans/chassis-cab", label: "Chassis cabs" },
];

const MAKE_LINKS = POPULAR_MAKES.map((m) => ({
  href: makeVansPath(m.slug),
  label: `${m.name} vans for sale`,
}));

/* Mirror of header.tsx nav — mobile sections. */
const SECTIONS = [
  {
    heading: "Buy a van",
    links: BODY_TYPE_LINKS,
  },
  {
    heading: "Browse by make",
    links: MAKE_LINKS,
  },
  {
    heading: "Dealers & selling",
    links: [
      { href: "/vans?view=map", label: "Search by map" },
      { href: "/dealers",    label: "Find a dealer" },
      { href: SELL_URL,      label: "Sell your van" },
      { href: "/advertise",  label: "Advertise with us" },
    ],
  },
  {
    heading: "More",
    links: [
      { href: "/van-news",          label: "Van news" },
      { href: "/van-reviews", label: "Van reviews" },
      { href: "/blog",        label: "Guides & news" },
      { href: "/van-lease-deals", label: "Van leasing" },
      { href: "/van-finance", label: "Finance" },
      { href: "/electric-vans", label: "Electric vans" },
      { href: "/van-insurance", label: "Insurance" },
    ],
  },
  {
    heading: "Account",
    links: [
      { href: "/saved", label: "Saved vans" },
      { href: "https://sell.vansales.com/login", label: "Sign in" },
      { href: "/sign-in", label: "Customer login" },
      { href: "https://dealer.vansales.com/login", label: "Dealer login" },
    ],
  },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  // Full-screen menu: lock the page behind it and close on Escape.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [open]);
  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-10 items-center justify-center rounded-[var(--radius-md)] text-ink-700 hover:bg-surface-2"
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open && createPortal(
        // Portalled to <body>: the sticky header has backdrop-filter, which would otherwise trap a position:fixed child inside the header box.
        <div
          id="mobile-menu"
          onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setOpen(false); }}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[60] overflow-y-auto bg-white px-[var(--gutter)] pb-10"
        >
          <div className="flex h-16 items-center justify-between">
            <Logo tone="dark" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex size-10 items-center justify-center rounded-[var(--radius-md)] text-ink-700 hover:bg-surface-2"
            >
              <span className="sr-only">Close menu</span>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          <nav className="mt-2 space-y-6 border-t border-border pt-5">
            {SECTIONS.map((section) => (
              <div key={section.heading}>
                <p className="mb-2 text-[length:var(--text-xs)] font-bold uppercase tracking-wider text-ink-400">
                  {section.heading}
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {section.links.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="py-1.5 text-[length:var(--text-sm)] font-semibold text-ink-700 hover:text-brand-600"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>,
        document.body,
      )}
    </div>
  );
}
