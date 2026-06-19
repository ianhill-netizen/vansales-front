"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRole } from "@/lib/roles/context";
import {
  MOCK_DEALER_STOCK,
  MOCK_LEADS,
  MOCK_PERFORMANCE,
} from "@/lib/roles/mock-data";

const CHANNEL_COLOR: Record<string, string> = {
  WhatsApp: "bg-success-tint text-success-700",
  Message: "bg-surface-2 text-ink-600",
  Finance: "bg-amber-50 text-amber-700",
  PX: "bg-purple-50 text-purple-700",
};

export default function DealerDashboardPage() {
  const { isDealer, isSwissVans, isAdmin, isLoggedIn, persona } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) router.replace("/dealer-portal/login");
    else if (!isDealer && !isSwissVans && !isAdmin) router.replace(persona.accountHref);
  }, [isLoggedIn, isDealer, isSwissVans, isAdmin, persona, router]);

  if (!isLoggedIn || (!isDealer && !isSwissVans && !isAdmin)) return null;

  const s = MOCK_DEALER_STOCK;
  const unreadLeads = MOCK_LEADS.filter((l) => !l.read).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[var(--text-2xl)] font-extrabold text-ink-900">
            {persona.displayName}
            {isSwissVans && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[var(--text-xs)] font-semibold text-amber-700">
                Owner
              </span>
            )}
          </h1>
          <p className="text-[var(--text-sm)] text-ink-500">Dealer Dashboard</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dealer-portal/listings" className="rounded-[var(--radius-md)] border border-border px-4 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-brand-500">
            Manage listings
          </Link>
          <button className="rounded-[var(--radius-md)] bg-brand-500 px-4 py-2 text-[var(--text-sm)] font-bold text-white hover:bg-brand-600">
            + Add van
          </button>
        </div>
      </div>

      {/* Stock summary stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {[
          { label: "Total stock", value: s.total, href: "/dealer-portal/listings" },
          { label: "Live adverts", value: s.live, href: "/dealer-portal/listings?status=live" },
          { label: "Unadvertised", value: s.unadvertised, href: "/dealer-portal/listings?status=unadvertised", warn: s.unadvertised > 0 },
          { label: "Aged 45+ days", value: s.aged45, href: "/dealer-portal/listings?aged=1", warn: s.aged45 > 0 },
          { label: "Boost tokens", value: s.boostTokens, href: "#", suffix: "" },
          { label: "Avg photos", value: s.avgPhotos, href: "#", suffix: "" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}
            className={`flex flex-col rounded-[var(--radius-xl)] border bg-white px-4 py-4 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] ${stat.warn ? "border-amber-300 bg-amber-50" : "border-border"}`}>
            <span className={`font-display text-[var(--text-2xl)] font-extrabold ${stat.warn ? "text-amber-700" : "text-ink-900"}`}>
              {stat.value}
            </span>
            <span className="mt-0.5 text-[var(--text-xs)] text-ink-500">{stat.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Leads */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-[var(--text-lg)] font-bold text-ink-900">
              Recent leads
              {unreadLeads > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full bg-brand-500 px-2 py-0.5 text-[var(--text-xs)] font-bold text-white">
                  {unreadLeads} new
                </span>
              )}
            </h2>
            <Link href="/dealer-portal/leads" className="text-[var(--text-xs)] font-semibold text-brand-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-sm)]">
            <ul className="divide-y divide-border">
              {MOCK_LEADS.map((lead) => (
                <li key={lead.id} className={`flex items-start gap-3 px-4 py-3.5 ${!lead.read ? "bg-brand-tint/40" : ""}`}>
                  {!lead.read && <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />}
                  {lead.read && <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-transparent" />}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-[var(--text-sm)] font-semibold text-ink-900">{lead.van}</p>
                    <p className="text-[var(--text-xs)] text-ink-500">{lead.buyer} · {lead.time}</p>
                    {lead.note && <p className="mt-0.5 text-[var(--text-xs)] text-ink-400">{lead.note}</p>}
                  </div>
                  <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[var(--text-2xs)] font-semibold ${CHANNEL_COLOR[lead.channel] ?? "bg-surface-2 text-ink-600"}`}>
                    {lead.channel}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Performance + Dealski CTAs */}
        <div className="space-y-5">
          {/* Performance mini-table */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-[var(--text-base)] font-bold text-ink-900">Performance (7 days)</h2>
              <Link href="/dealer-portal/analytics" className="text-[var(--text-xs)] font-semibold text-brand-600 hover:underline">All →</Link>
            </div>
            <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white">
              <table className="w-full text-[var(--text-xs)]">
                <thead>
                  <tr className="border-b border-border bg-surface-0">
                    <th className="px-3 py-2 text-left font-semibold text-ink-400">Van</th>
                    <th className="px-3 py-2 text-right font-semibold text-ink-400">Views</th>
                    <th className="px-3 py-2 text-right font-semibold text-ink-400">Leads</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {MOCK_PERFORMANCE.slice(0, 4).map((p) => (
                    <tr key={p.van} className="hover:bg-surface-0">
                      <td className="max-w-[120px] truncate px-3 py-2 font-medium text-ink-700">{p.van}</td>
                      <td className="px-3 py-2 text-right text-ink-600">{p.views}</td>
                      <td className="px-3 py-2 text-right">
                        <span className={p.enquiries > 0 ? "font-bold text-success-600" : "text-ink-400"}>{p.enquiries}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Dealski CTAs */}
          <section className="rounded-[var(--radius-xl)] border border-border bg-white px-5 py-5">
            <p className="mb-3 text-[var(--text-xs)] font-bold uppercase tracking-widest text-ink-400">Dealski tools</p>
            <div className="space-y-2">
              {[
                { label: "Finance applications", count: "2 pending", href: "#" },
                { label: "Part-exchange valuations", count: "1 new", href: "#" },
                { label: "Live stock feed status", count: "✓ Synced", href: "#" },
              ].map((item) => (
                <Link key={item.label} href={item.href}
                  className="flex items-center justify-between rounded-[var(--radius-lg)] border border-border px-3 py-2.5 text-[var(--text-xs)] hover:border-brand-400/50">
                  <span className="font-medium text-ink-700">{item.label}</span>
                  <span className="text-ink-500">{item.count}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Listing quality / boost */}
          <section className="rounded-[var(--radius-xl)] border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-[var(--text-xs)] font-bold uppercase tracking-widest text-amber-700">Listing quality</p>
            <p className="mt-2 text-[var(--text-sm)] text-amber-800">
              <strong>{s.needsPhotos} listing{s.needsPhotos !== 1 ? "s" : ""}</strong> need more photos (avg {s.avgPhotos})
            </p>
            <Link href="/dealer-portal/listings?filter=needsPhotos" className="mt-3 inline-block rounded-[var(--radius-md)] bg-amber-600 px-3 py-1.5 text-[var(--text-xs)] font-bold text-white hover:bg-amber-700">
              Fix now →
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
