"use client";

import Link from "next/link";
import { useRole } from "@/lib/roles/context";
import { MOCK_DEALER_STOCK } from "@/lib/roles/mock-data";

const PLANS = [
  { id: "starter", label: "Starter", price: "£39/mo", vansIncluded: 20 },
  { id: "pro", label: "Pro", price: "£89/mo", vansIncluded: 75 },
  { id: "premium", label: "Premium", price: "£199/mo", vansIncluded: Infinity },
];

export default function DealerAccountPage() {
  const { persona, isSwissVans } = useRole();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 font-display text-[var(--text-2xl)] font-extrabold text-ink-900">Dealer account</h1>

      {/* Business info */}
      <section className="mb-5 rounded-[var(--radius-xl)] border border-border bg-white px-6 py-5">
        <h2 className="mb-4 text-[var(--text-xs)] font-bold uppercase tracking-widest text-ink-400">Business details</h2>
        <dl className="grid grid-cols-2 gap-3 text-[var(--text-sm)]">
          {[
            { label: "Trading name", value: persona.displayName },
            { label: "Contact email", value: persona.email },
            { label: "Phone", value: "+44 (0) 1234 567890" },
            { label: "Location", value: "Cumbria, CA" },
            { label: "Vans in stock", value: MOCK_DEALER_STOCK.total },
            { label: "Member since", value: "January 2024" },
          ].map((row) => (
            <div key={row.label}>
              <dt className="text-ink-400">{row.label}</dt>
              <dd className="font-semibold text-ink-800">{row.value}</dd>
            </div>
          ))}
        </dl>
        <button className="mt-4 rounded-[var(--radius-md)] border border-border px-4 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400">
          Edit details
        </button>
      </section>

      {/* Plan */}
      <section className="mb-5 rounded-[var(--radius-xl)] border border-border bg-white px-6 py-5">
        <h2 className="mb-4 text-[var(--text-xs)] font-bold uppercase tracking-widest text-ink-400">Current plan</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-[var(--text-lg)] font-bold text-ink-900">
              {isSwissVans ? "Featured (owner)" : "Pro"} plan
            </p>
            <p className="text-[var(--text-sm)] text-ink-500">{isSwissVans ? "Free · Featured listing on all search pages" : "£89/mo · Up to 75 vans + analytics"}</p>
          </div>
          {!isSwissVans && (
            <Link href="/advertise" className="rounded-[var(--radius-md)] border border-brand-500 px-4 py-2 text-[var(--text-sm)] font-semibold text-brand-700 hover:bg-brand-tint">
              Upgrade →
            </Link>
          )}
        </div>
      </section>

      {/* Boost tokens */}
      <section className="mb-5 rounded-[var(--radius-xl)] border border-border bg-white px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[var(--text-xs)] font-bold uppercase tracking-widest text-ink-400">Boost tokens</h2>
            <p className="mt-1 font-display text-[var(--text-2xl)] font-extrabold text-ink-900">{MOCK_DEALER_STOCK.boostTokens}</p>
            <p className="text-[var(--text-xs)] text-ink-400">1 token = 1 day of boosted placement</p>
          </div>
          <button className="rounded-[var(--radius-md)] bg-brand-500 px-4 py-2 text-[var(--text-sm)] font-bold text-white hover:bg-brand-600">
            Top up
          </button>
        </div>
      </section>

      {/* Dealski connection */}
      <section className="mb-5 rounded-[var(--radius-xl)] border border-success-200 bg-success-tint px-6 py-5">
        <h2 className="mb-1 text-[var(--text-xs)] font-bold uppercase tracking-widest text-success-700">Dealski</h2>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success-500" />
          <p className="text-[var(--text-sm)] font-semibold text-success-700">Connected · Stock syncs automatically</p>
        </div>
        <p className="mt-1 text-[var(--text-xs)] text-success-600">Tenant: swissvans · {MOCK_DEALER_STOCK.total} vans in feed</p>
      </section>

      {/* Danger zone */}
      <section className="rounded-[var(--radius-xl)] border border-border px-6 py-5">
        <h2 className="mb-3 text-[var(--text-xs)] font-bold uppercase tracking-widest text-ink-400">Account</h2>
        <div className="flex gap-3">
          <button className="text-[var(--text-sm)] text-ink-500 hover:underline">Change password</button>
          <button className="text-[var(--text-sm)] text-red-500 hover:underline">Sign out</button>
        </div>
      </section>
    </div>
  );
}
