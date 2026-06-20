"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRole } from "@/lib/roles/context";
import { MOCK_DEALERS, MOCK_PENDING_LISTINGS } from "@/lib/roles/mock-data";
import { IconList, IconSettings } from "@/components/icons";

export default function AdminDashboardPage() {
  const { isAdmin, isLoggedIn } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) router.replace("/sign-in");
    else if (!isAdmin) router.replace("/");
  }, [isAdmin, isLoggedIn, router]);

  if (!isLoggedIn || !isAdmin) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-[var(--text-2xl)] font-extrabold text-ink-900">Admin dashboard</h1>
        <span className="rounded-[var(--radius-pill)] bg-danger-tint px-3 py-1 text-[var(--text-xs)] font-bold text-danger-700">SIMULATION — not real data</span>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Active dealers", value: MOCK_DEALERS.filter((d) => d.status === "active").length },
          { label: "Total vans live", value: MOCK_DEALERS.reduce((s, d) => s + d.vans, 0) },
          { label: "Pending review", value: MOCK_PENDING_LISTINGS.length, warn: true },
          { label: "Trials", value: MOCK_DEALERS.filter((d) => d.status === "trial").length },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-[var(--radius-xl)] border bg-white px-5 py-4 shadow-[var(--shadow-sm)] ${stat.warn ? "border-amber-300 bg-amber-50" : "border-border"}`}>
            <p className={`font-display text-[var(--text-2xl)] font-extrabold ${stat.warn ? "text-amber-700" : "text-ink-900"}`}>{stat.value}</p>
            <p className="text-[var(--text-xs)] text-ink-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Dealers */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-[var(--text-lg)] font-bold text-ink-900">Dealers</h2>
            <Link href="/admin/dealers" className="text-[var(--text-xs)] font-semibold text-brand-600 hover:underline">All →</Link>
          </div>
          <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-sm)]">
            <table className="w-full text-[var(--text-sm)]">
              <thead>
                <tr className="border-b border-border bg-surface-0">
                  {["Dealer", "Plan", "Vans", "Status"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[var(--text-xs)] font-semibold uppercase tracking-wider text-ink-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {MOCK_DEALERS.map((d) => (
                  <tr key={d.id} className="hover:bg-surface-0">
                    <td className="px-4 py-3 font-medium text-ink-800">{d.name}</td>
                    <td className="px-4 py-3 text-[var(--text-xs)] font-semibold text-brand-700">{d.plan}</td>
                    <td className="px-4 py-3 text-ink-500">{d.vans}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[var(--text-2xs)] font-semibold capitalize ${d.status === "active" ? "bg-success-tint text-success-700" : "bg-amber-50 text-amber-700"}`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pending listings */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-[var(--text-lg)] font-bold text-ink-900">
              Pending moderation
              <span className="ml-2 inline-flex items-center rounded-full bg-warning-600 px-2 py-0.5 text-[var(--text-xs)] font-bold text-white">
                {MOCK_PENDING_LISTINGS.length}
              </span>
            </h2>
            <Link href="/admin/listings" className="text-[var(--text-xs)] font-semibold text-brand-600 hover:underline">All →</Link>
          </div>
          <div className="overflow-hidden rounded-[var(--radius-xl)] border border-amber-200 bg-white shadow-[var(--shadow-sm)]">
            <ul className="divide-y divide-border">
              {MOCK_PENDING_LISTINGS.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-4 px-4 py-3.5 hover:bg-surface-0">
                  <div>
                    <p className="font-medium text-ink-900">{item.van}</p>
                    <p className="text-[var(--text-xs)] text-ink-500">{item.dealer} · {item.submitted}</p>
                    <p className="text-[var(--text-xs)] text-amber-700">{item.reason}</p>
                  </div>
                  <div className="flex flex-shrink-0 gap-2">
                    <button className="rounded-[var(--radius-sm)] bg-success-600 px-2 py-1 text-[var(--text-2xs)] font-bold text-white hover:bg-success-700">Approve</button>
                    <button className="rounded-[var(--radius-sm)] border border-danger-500/20 px-2 py-1 text-[var(--text-2xs)] font-bold text-danger-700 hover:bg-danger-tint">Reject</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Quick links to sections */}
        <section className="lg:col-span-2">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Dealer management", href: "/admin/dealers", Icon: IconSettings },
              { label: "Listing moderation", href: "/admin/listings", Icon: IconList },
              { label: "API & integrations", href: "/admin/integrations", Icon: IconSettings },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-border bg-white px-5 py-4 shadow-[var(--shadow-sm)] hover:border-brand-400/40 hover:shadow-[var(--shadow-md)]">
                <item.Icon width={20} height={20} className="shrink-0 text-ink-400" aria-hidden />
                <span className="font-semibold text-ink-800">{item.label}</span>
                <span className="ml-auto text-ink-400">→</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
