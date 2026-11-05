"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand";
import {
  IconBarChart, IconGrid, IconLeads, IconSettings, IconChevronLeft,
} from "@/components/icons";

const NAV_ITEMS = [
  { href: "/admin",              label: "Overview",     icon: <IconGrid    width={16} height={16} /> },
  { href: "/admin/listings",     label: "Listings",     icon: <IconBarChart width={16} height={16} /> },
  { href: "/admin/dealers",      label: "Dealers",      icon: <IconLeads   width={16} height={16} /> },
  { href: "/admin/integrations", label: "Integrations", icon: <IconSettings width={16} height={16} /> },
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

      {/* Primary nav */}
      <nav className="flex-1 px-3 py-1" aria-label="Portal navigation">
        <p className="mb-2 px-2.5 text-[length:var(--text-2xs)] font-bold uppercase tracking-[var(--tracking-eyebrow)] text-white/30">
          Admin
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const exact  = item.href === "/admin";
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
