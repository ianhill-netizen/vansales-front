"use client";

import { useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "/vans?condition=new", label: "New vans" },
  { href: "/vans?condition=used", label: "Used vans" },
  { href: "/van-contract-hire", label: "Van Contract Hire" },
  { href: "/van-insurance", label: "Van Insurance" },
  { href: "/sell", label: "Sell your van" },
  { href: "/advertise", label: "Advertise" },
  { href: "/van-finance", label: "Van Finance" },
  { href: "/van-reviews", label: "Van reviews" },
  { href: "/directory", label: "Van Directory" },
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
          className="absolute inset-x-0 top-full z-50 border-t border-border bg-white px-[var(--gutter)] py-2 shadow-[var(--shadow-md)]"
        >
          <nav className="flex flex-col divide-y divide-border">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 text-[var(--text-md)] font-semibold text-ink-700 hover:text-brand-600"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
