"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand";
import {
  IconBarChart, IconGrid, IconLeads, IconSettings, IconPlus, IconChevronLeft,
} from "@/components/icons";

const NAV_ITEMS = [
  { href: "/dealer-portal",           label: "Dashboard",  icon: <IconGrid    width={16} height={16} /> },
  { href: "/dealer-portal/listings",  label: "Listings",   icon: <IconBarChart width={16} height={16} /> },
  { href: "/dealer-portal/leads",     label: "Leads",      icon: <IconLeads   width={16} height={16} /> },
  { href: "/dealer-portal/analytics", label: "Analytics",  icon: <IconBarChart width={16} height={16} /> },
  { href: "/dealer-portal/account",   label: "Account",    icon: <IconSettings width={16} height={16} /> },
] as const;

function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside
      className="flex h-screen w-[var(--sidebar-width)] flex-col overflow-y-auto py-5 thin-scroll"
      style={{ background: "var(--color-portal-sidebar)" }}
    >
      {/* Logo */}
      <div className="px-4 pb-6 pt-2">
        <Link href="/" className="block">
          <Logo tone="light" />
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-4 mb-4 h-px bg-white/8" />

      {/* Add van CTA */}
      <div className="px-3 pb-3">
        <Link
          href="/dealer-portal/add-van"
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] py-2.5 text-[var(--text-sm)] font-bold text-white transition-all"
          style={{ background: "linear-gradient(135deg, #f47c1e 0%, #d96410 100%)" }}
        >
          <IconPlus width={14} height={14} strokeWidth={2.5} />
          Add van
        </Link>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 px-3 py-1" aria-label="Portal navigation">
        <p className="mb-2 px-2.5 text-[var(--text-2xs)] font-bold uppercase tracking-[var(--tracking-eyebrow)] text-white/30">
          Dealer portal
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const exact  = item.href === "/dealer-portal";
            const active = exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link href={item.href} className={`sidebar-link ${active ? "active" : ""}`}>
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="mt-auto px-3 pb-2">
        <div className="h-px bg-white/8 mb-3" />
        <Link href="/" className="sidebar-link">
          <IconChevronLeft width={16} height={16} />
          Back to site
        </Link>
      </div>
    </aside>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-portal-canvas)" }}>
      {/* Fixed sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-[var(--sidebar-width)]">
        <SidebarNav />
      </div>

      {/* Mobile top bar */}
      <header
        className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between px-4 md:hidden"
        style={{ background: "var(--color-portal-sidebar)" }}
      >
        <Link href="/">
          <Logo tone="light" />
        </Link>
        <Link
          href="/dealer-portal/add-van"
          className="flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-xs)] font-bold text-white"
          style={{ background: "linear-gradient(135deg, #f47c1e 0%, #d96410 100%)" }}
        >
          <IconPlus width={12} height={12} strokeWidth={2.5} /> Add van
        </Link>
      </header>

      {/* Main content — offset by sidebar on desktop */}
      <main
        className="flex-1 md:ml-[var(--sidebar-width)]"
        style={{ minHeight: "100vh" }}
      >
        <div className="pt-14 md:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
