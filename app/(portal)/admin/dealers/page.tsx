"use client";

import { MOCK_DEALERS } from "@/lib/roles/mock-data";

const PLAN_COLOR: Record<string, string> = {
  Featured: "bg-amber-100 text-amber-700",
  Pro: "bg-brand-tint text-brand-700",
  Starter: "bg-surface-2 text-ink-600",
  Trial: "bg-purple-50 text-purple-700",
};

export default function AdminDealersPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-[var(--text-2xl)] font-extrabold text-ink-900">Dealers</h1>
        <button className="rounded-[var(--radius-md)] bg-ink-900 px-4 py-2 text-[var(--text-sm)] font-bold text-white hover:bg-ink-700">
          + Add dealer
        </button>
      </div>
      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-sm)]">
        <table className="w-full text-[var(--text-sm)]">
          <thead>
            <tr className="border-b border-border bg-surface-0">
              {["Dealer", "Plan", "Vans", "Status", "Joined", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[var(--text-xs)] font-semibold uppercase tracking-wider text-ink-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MOCK_DEALERS.map((d) => (
              <tr key={d.id} className="hover:bg-surface-0">
                <td className="px-4 py-3 font-medium text-ink-800">{d.name}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[var(--text-2xs)] font-bold ${PLAN_COLOR[d.plan] ?? "bg-surface-2 text-ink-600"}`}>
                    {d.plan}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-500">{d.vans}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[var(--text-2xs)] font-semibold capitalize ${d.status === "active" ? "bg-success-tint text-success-700" : "bg-amber-50 text-amber-700"}`}>
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--text-xs)] text-ink-400">{d.joined}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="rounded-[var(--radius-sm)] border border-border px-2.5 py-1 text-[var(--text-2xs)] font-semibold text-ink-600 hover:border-brand-400">View</button>
                    <button className="rounded-[var(--radius-sm)] border border-border px-2.5 py-1 text-[var(--text-2xs)] font-semibold text-ink-600 hover:border-brand-400">Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
