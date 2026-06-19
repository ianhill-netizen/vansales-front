"use client";

import { useState } from "react";
import { MOCK_PENDING_LISTINGS, MOCK_DEALER_LISTINGS } from "@/lib/roles/mock-data";

export default function AdminListingsPage() {
  const [approved, setApproved] = useState<string[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);

  const pending = MOCK_PENDING_LISTINGS.filter((p) => !approved.includes(p.id) && !rejected.includes(p.id));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 font-display text-[var(--text-2xl)] font-extrabold text-ink-900">Listing moderation</h1>

      {/* Pending queue */}
      <section className="mb-8">
        <h2 className="mb-3 font-display text-[var(--text-lg)] font-bold text-ink-900">
          Pending review
          {pending.length > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full bg-amber-500 px-2 py-0.5 text-[var(--text-xs)] font-bold text-white">
              {pending.length}
            </span>
          )}
        </h2>
        {pending.length === 0 ? (
          <div className="rounded-[var(--radius-xl)] border border-dashed border-border bg-surface-0 py-8 text-center text-[var(--text-sm)] text-ink-400">
            No listings pending review
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 rounded-[var(--radius-xl)] border border-amber-200 bg-white px-5 py-4 shadow-[var(--shadow-sm)]">
                <div>
                  <p className="font-semibold text-ink-900">{item.van}</p>
                  <p className="text-[var(--text-sm)] text-ink-500">{item.dealer} · Submitted {item.submitted}</p>
                  <p className="mt-1 text-[var(--text-xs)] text-amber-700">Reason: {item.reason}</p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <button className="rounded-[var(--radius-md)] border border-border px-3 py-1.5 text-[var(--text-xs)] font-semibold text-ink-600 hover:border-ink-400">
                    Preview
                  </button>
                  <button onClick={() => setApproved((a) => [...a, item.id])}
                    className="rounded-[var(--radius-md)] bg-success-600 px-3 py-1.5 text-[var(--text-xs)] font-bold text-white hover:bg-success-700">
                    Approve
                  </button>
                  <button onClick={() => setRejected((r) => [...r, item.id])}
                    className="rounded-[var(--radius-md)] border border-red-200 px-3 py-1.5 text-[var(--text-xs)] font-bold text-red-600 hover:bg-red-50">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* All listings (read-only sample) */}
      <section>
        <h2 className="mb-3 font-display text-[var(--text-lg)] font-bold text-ink-900">All live listings (sample)</h2>
        <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-sm)]">
          <table className="w-full text-[var(--text-sm)]">
            <thead>
              <tr className="border-b border-border bg-surface-0">
                {["Van", "Price", "Photos", "Age", "Status"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[var(--text-xs)] font-semibold uppercase tracking-wider text-ink-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_DEALER_LISTINGS.map((l) => (
                <tr key={l.id} className="hover:bg-surface-0">
                  <td className="px-4 py-3 font-medium text-ink-800">{l.make} {l.model}</td>
                  <td className="px-4 py-3 font-semibold text-ink-900">£{l.price.toLocaleString()}</td>
                  <td className={`px-4 py-3 ${l.photos === 0 ? "font-semibold text-red-500" : "text-ink-500"}`}>{l.photos}</td>
                  <td className={`px-4 py-3 text-[var(--text-xs)] ${l.age >= 45 ? "font-semibold text-amber-600" : "text-ink-400"}`}>{l.age}d</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[var(--text-2xs)] font-semibold capitalize ${l.status === "live" ? "bg-success-tint text-success-700" : "bg-surface-2 text-ink-500"}`}>
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
