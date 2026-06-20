"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type DbListing = {
  id: string;
  make: string;
  model: string;
  derivative: string | null;
  year: number | null;
  price: number | null;
  status: "active" | "sold" | "draft";
  createdAt: string;
};

type Filter = "all" | "active" | "draft" | "sold";

function age(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000);
}

const STATUS_LABEL: Record<DbListing["status"], string> = {
  active: "Live",
  draft: "Draft",
  sold: "Sold",
};

const STATUS_COLOR: Record<DbListing["status"], string> = {
  active: "bg-success-tint text-success-700",
  draft: "bg-surface-2 text-ink-500",
  sold: "bg-sold-tint text-sold-600",
};

export default function DealerListingsPage() {
  const [listings, setListings] = useState<DbListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/listings");
      if (!res.ok) throw new Error("Failed to load listings");
      const data = await res.json() as { listings: DbListing[] };
      setListings(data.listings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading listings");
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchListings(); }, [fetchListings]);

  async function updateStatus(id: string, status: DbListing["status"]) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/portal/listings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update listing");
      setListings((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
    } catch {
      /* no-op */
    } finally {
      setUpdating(null);
    }
  }

  const filtered = listings.filter((l) => filter === "all" || l.status === filter);
  const counts: Record<Filter, number> = {
    all: listings.length,
    active: listings.filter((l) => l.status === "active").length,
    draft: listings.filter((l) => l.status === "draft").length,
    sold: listings.filter((l) => l.status === "sold").length,
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[var(--text-2xl)] font-extrabold text-ink-900">Listings</h1>
        <div className="flex gap-2">
          {(["all", "active", "draft", "sold"] as Filter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-[var(--text-xs)] font-semibold capitalize transition-colors ${filter === f ? "bg-ink-900 text-white" : "border border-border bg-white text-ink-600 hover:border-ink-400"}`}>
              {f === "all" ? "All" : STATUS_LABEL[f as DbListing["status"]]}
              {f !== "all" && ` (${counts[f]})`}
            </button>
          ))}
          <Link href="/dealer-portal/add-van" className="rounded-[var(--radius-md)] bg-brand-500 px-4 py-1.5 text-[var(--text-xs)] font-bold text-white hover:bg-brand-600">
            + Add van
          </Link>
        </div>
      </div>

      {loading && (
        <div className="rounded-[var(--radius-xl)] border border-border bg-white px-6 py-12 text-center text-[var(--text-sm)] text-ink-400 shadow-[var(--shadow-sm)]">
          Loading listings…
        </div>
      )}

      {error && (
        <div className="rounded-[var(--radius-md)] border border-danger-500/20 bg-danger-tint px-5 py-4 text-[var(--text-sm)] text-danger-700">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-[var(--radius-xl)] border border-dashed border-border bg-white px-6 py-16 text-center shadow-[var(--shadow-sm)]">
          <p className="text-[var(--text-base)] font-semibold text-ink-600">No listings yet</p>
          <p className="mt-1 text-[var(--text-sm)] text-ink-400">Add your first van to get started.</p>
          <Link href="/dealer-portal/add-van" className="mt-5 inline-block rounded-[var(--radius-md)] bg-brand-500 px-5 py-2.5 text-[var(--text-sm)] font-bold text-white hover:bg-brand-600">
            Add a van →
          </Link>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-sm)]">
          <table className="w-full text-[var(--text-sm)]">
            <thead>
              <tr className="border-b border-border bg-surface-0">
                {["Van", "Year", "Price", "Age", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[var(--text-xs)] font-semibold uppercase tracking-wider text-ink-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((l) => {
                const dayAge = age(l.createdAt);
                return (
                  <tr key={l.id} className="hover:bg-surface-0">
                    <td className="px-4 py-3 font-medium text-ink-800">
                      {l.make} {l.model}{l.derivative ? ` — ${l.derivative}` : ""}
                    </td>
                    <td className="px-4 py-3 text-ink-500">{l.year ?? "—"}</td>
                    <td className="px-4 py-3 font-semibold text-ink-900">
                      {l.price ? `£${l.price.toLocaleString()}` : <span className="text-ink-400">POA</span>}
                    </td>
                    <td className={`px-4 py-3 text-[var(--text-xs)] ${dayAge >= 45 ? "font-semibold text-amber-600" : "text-ink-400"}`}>
                      {dayAge}d
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[var(--text-2xs)] font-semibold ${STATUS_COLOR[l.status]}`}>
                        {STATUS_LABEL[l.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {l.status === "draft" && (
                          <button
                            onClick={() => updateStatus(l.id, "active")}
                            disabled={updating === l.id}
                            className="rounded-[var(--radius-sm)] bg-success-600 px-2 py-1 text-[var(--text-2xs)] font-semibold text-white hover:bg-success-700 disabled:opacity-50"
                          >
                            Publish
                          </button>
                        )}
                        {l.status === "active" && (
                          <button
                            onClick={() => updateStatus(l.id, "draft")}
                            disabled={updating === l.id}
                            className="rounded-[var(--radius-sm)] border border-border px-2 py-1 text-[var(--text-2xs)] font-semibold text-ink-600 hover:border-ink-400 disabled:opacity-50"
                          >
                            Unpublish
                          </button>
                        )}
                        {l.status === "active" && (
                          <button
                            onClick={() => updateStatus(l.id, "sold")}
                            disabled={updating === l.id}
                            className="rounded-[var(--radius-sm)] border border-border px-2 py-1 text-[var(--text-2xs)] font-semibold text-ink-600 hover:border-ink-400 disabled:opacity-50"
                          >
                            Mark sold
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
