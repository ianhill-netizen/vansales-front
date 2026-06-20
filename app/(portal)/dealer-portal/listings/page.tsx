"use client";

import { useState } from "react";
import Link from "next/link";
import { useDealerListings } from "@/lib/dealer/listings-context";

const STATUS_COLOR: Record<string, string> = {
  live: "bg-success-tint text-success-700",
  unadvertised: "bg-surface-2 text-ink-500",
};

export default function DealerListingsPage() {
  const { listings } = useDealerListings();
  const [filter, setFilter] = useState<"all" | "live" | "unadvertised">("all");
  const filtered = listings.filter((l) => filter === "all" || l.status === filter);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[var(--text-2xl)] font-extrabold text-ink-900">Listings</h1>
        <div className="flex gap-2">
          {(["all", "live", "unadvertised"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-[var(--text-xs)] font-semibold capitalize transition-colors ${filter === f ? "bg-ink-900 text-white" : "border border-border bg-white text-ink-600 hover:border-ink-400"}`}>
              {f} {f !== "all" && `(${listings.filter((l) => l.status === f).length})`}
            </button>
          ))}
          <Link href="/dealer-portal/add-van" className="rounded-[var(--radius-md)] bg-brand-500 px-4 py-1.5 text-[var(--text-xs)] font-bold text-white hover:bg-brand-600">
            + Add van
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-sm)]">
        <table className="w-full text-[var(--text-sm)]">
          <thead>
            <tr className="border-b border-border bg-surface-0">
              {["Van", "Year", "Price", "Photos", "Age", "Status", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[var(--text-xs)] font-semibold uppercase tracking-wider text-ink-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((l) => (
              <tr key={l.id} className="hover:bg-surface-0">
                <td className="px-4 py-3 font-medium text-ink-800">{l.make} {l.model}</td>
                <td className="px-4 py-3 text-ink-500">{l.year}</td>
                <td className="px-4 py-3 font-semibold text-ink-900">£{l.price.toLocaleString()}</td>
                <td className={`px-4 py-3 ${l.photos === 0 ? "font-semibold text-red-500" : l.photos < 5 ? "text-amber-600" : "text-ink-500"}`}>
                  {l.photos === 0 ? "No photos" : `${l.photos} photos`}
                </td>
                <td className={`px-4 py-3 text-[var(--text-xs)] ${l.age >= 45 ? "font-semibold text-amber-600" : "text-ink-400"}`}>
                  {l.age}d
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[var(--text-2xs)] font-semibold capitalize ${STATUS_COLOR[l.status] ?? ""}`}>
                    {l.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="rounded-[var(--radius-sm)] border border-border px-2 py-1 text-[var(--text-2xs)] font-semibold text-ink-600 hover:border-brand-400">
                      Edit
                    </button>
                    {l.status === "unadvertised" && (
                      <button className="rounded-[var(--radius-sm)] bg-success-600 px-2 py-1 text-[var(--text-2xs)] font-semibold text-white hover:bg-success-700">
                        Publish
                      </button>
                    )}
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
