import Link from "next/link";
import { Logo } from "@/components/brand";
import { DealerListingsProvider } from "@/lib/dealer/listings-context";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-0">
      <header className="sticky top-0 z-30 border-b border-border bg-ink-900">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4">
          <Link href="/" className="flex-shrink-0">
            <Logo tone="light" />
          </Link>
          {/* spacer so nav items go right */}
          <div className="flex-1" />
          <Link href="/dealer-portal" className="text-[var(--text-xs)] font-semibold text-white/70 hover:text-white">
            Dashboard
          </Link>
          <Link href="/dealer-portal/listings" className="text-[var(--text-xs)] font-semibold text-white/70 hover:text-white">
            Listings
          </Link>
          <Link href="/dealer-portal/leads" className="text-[var(--text-xs)] font-semibold text-white/70 hover:text-white">
            Leads
          </Link>
          <Link href="/dealer-portal/analytics" className="text-[var(--text-xs)] font-semibold text-white/70 hover:text-white">
            Analytics
          </Link>
          <Link href="/dealer-portal/account" className="text-[var(--text-xs)] font-semibold text-white/70 hover:text-white">
            Account
          </Link>
          <Link href="/" className="ml-2 rounded-[var(--radius-sm)] border border-white/20 px-3 py-1.5 text-[var(--text-xs)] font-semibold text-white/70 hover:border-white/40 hover:text-white">
            ← Back to site
          </Link>
        </div>
      </header>
      <DealerListingsProvider>
        <main className="flex-1">{children}</main>
      </DealerListingsProvider>
    </div>
  );
}
