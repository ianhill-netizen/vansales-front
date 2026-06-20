"use client";

import { useState } from "react";
import Link from "next/link";

const SECTIONS = [
  {
    heading: "Browse by body type",
    links: [
      { href: "/vans/panel-van", label: "Panel vans" },
      { href: "/vans/luton", label: "Luton vans" },
      { href: "/vans/tipper", label: "Tippers" },
      { href: "/vans/dropside", label: "Dropsides" },
      { href: "/vans/crew-van", label: "Crew vans" },
      { href: "/vans/pickup", label: "Pickups" },
      { href: "/vans/minibus", label: "Minibuses" },
      { href: "/vans/chassis-cab", label: "Chassis cabs" },
    ],
  },
  {
    heading: "Browse by make",
    links: [
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
    ],
  },
  {
    heading: "New, used & electric",
    links: [
      { href: "/vans/new", label: "New vans" },
      { href: "/vans/used", label: "Used vans" },
      { href: "/vans/electric", label: "Electric vans" },
      { href: "/vans/ulez", label: "ULEZ-compliant vans" },
    ],
  },
  {
    heading: "More",
    links: [
      { href: "/new-vans", label: "Model guide" },
      { href: "/van-finance", label: "Finance" },
      { href: "/blog", label: "Guides" },
      { href: "/advertise", label: "Advertise" },
    ],
  },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
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

      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full z-50 max-h-[80vh] overflow-y-auto border-t border-border bg-white px-[var(--gutter)] py-4 shadow-[var(--shadow-md)]"
        >
          <nav className="space-y-5">
            {SECTIONS.map((section) => (
              <div key={section.heading}>
                <p className="mb-2 text-[var(--text-xs)] font-bold uppercase tracking-wider text-ink-400">
                  {section.heading}
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {section.links.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="py-1.5 text-[var(--text-sm)] font-semibold text-ink-700 hover:text-brand-600"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
