"use client";

import { MOCK_PERFORMANCE } from "@/lib/roles/mock-data";

export default function AnalyticsPage() {
  const maxViews = Math.max(...MOCK_PERFORMANCE.map((p) => p.views));
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 font-display text-[var(--text-2xl)] font-extrabold text-ink-900">Analytics</h1>

      {/* Summary row */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: "Total views (7d)", value: MOCK_PERFORMANCE.reduce((s, p) => s + p.views, 0) },
          { label: "Total enquiries (7d)", value: MOCK_PERFORMANCE.reduce((s, p) => s + p.enquiries, 0) },
          { label: "Conversion rate", value: `${((MOCK_PERFORMANCE.reduce((s, p) => s + p.enquiries, 0) / MOCK_PERFORMANCE.reduce((s, p) => s + p.views, 0)) * 100).toFixed(1)}%` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[var(--radius-xl)] border border-border bg-white px-5 py-4 shadow-[var(--shadow-sm)]">
            <p className="font-display text-[var(--text-2xl)] font-extrabold text-ink-900">{stat.value}</p>
            <p className="text-[var(--text-xs)] text-ink-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Performance table with view-bar */}
      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-sm)]">
        <table className="w-full text-[var(--text-sm)]">
          <thead>
            <tr className="border-b border-border bg-surface-0">
              <th className="px-4 py-3 text-left text-[var(--text-xs)] font-semibold uppercase tracking-wider text-ink-400">Van</th>
              <th className="px-4 py-3 text-right text-[var(--text-xs)] font-semibold uppercase tracking-wider text-ink-400">Views</th>
              <th className="hidden px-4 py-3 sm:table-cell" />
              <th className="px-4 py-3 text-right text-[var(--text-xs)] font-semibold uppercase tracking-wider text-ink-400">Leads</th>
              <th className="px-4 py-3 text-right text-[var(--text-xs)] font-semibold uppercase tracking-wider text-ink-400">Days listed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MOCK_PERFORMANCE.map((p) => (
              <tr key={p.van} className="hover:bg-surface-0">
                <td className="px-4 py-3 font-medium text-ink-800">{p.van}</td>
                <td className="px-4 py-3 text-right font-semibold text-ink-900">{p.views}</td>
                <td className="hidden w-40 px-4 py-3 sm:table-cell">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-brand-400" style={{ width: `${(p.views / maxViews) * 100}%` }} />
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={p.enquiries > 0 ? "font-bold text-success-600" : "text-ink-400"}>{p.enquiries}</span>
                </td>
                <td className={`px-4 py-3 text-right text-[var(--text-xs)] ${p.daysListed >= 45 ? "font-semibold text-amber-600" : "text-ink-400"}`}>
                  {p.daysListed}d
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-center text-[var(--text-xs)] text-ink-400">
        Analytics are mock data. Real metrics will appear here in Phase 1.
      </p>
    </div>
  );
}
