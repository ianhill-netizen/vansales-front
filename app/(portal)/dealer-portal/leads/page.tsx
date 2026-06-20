"use client";

import { useEffect, useState } from "react";

type Lead = {
  id: string;
  name: string;
  contact: string;
  channel: string;
  message: string;
  createdAt: string;
  listingRef: string;
  listing: { make: string; model: string; year: number | null; derivative: string | null } | null;
};

const CHANNEL_COLOR: Record<string, string> = {
  WhatsApp: "bg-success-tint text-success-700",
  Web: "bg-surface-2 text-ink-600",
  Finance: "bg-amber-50 text-amber-700",
  PX: "bg-purple-50 text-purple-700",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/portal/leads")
      .then((r) => r.json())
      .then((d: { leads: Lead[] }) => setLeads(d.leads))
      .catch(() => setError("Failed to load leads"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-[var(--text-2xl)] font-extrabold text-ink-900">All leads</h1>
        <span className="text-[var(--text-sm)] text-ink-500">{leads.length} total</span>
      </div>

      {loading && (
        <div className="rounded-[var(--radius-xl)] border border-border bg-white px-6 py-12 text-center text-[var(--text-sm)] text-ink-400 shadow-[var(--shadow-sm)]">
          Loading leads…
        </div>
      )}

      {error && (
        <div className="rounded-[var(--radius-md)] border border-danger-500/20 bg-danger-tint px-5 py-4 text-[var(--text-sm)] text-danger-700">
          {error}
        </div>
      )}

      {!loading && !error && leads.length === 0 && (
        <div className="rounded-[var(--radius-xl)] border border-dashed border-border bg-white px-6 py-16 text-center shadow-[var(--shadow-sm)]">
          <p className="text-[var(--text-base)] font-semibold text-ink-600">No leads yet</p>
          <p className="mt-1 text-[var(--text-sm)] text-ink-400">
            Enquiries on your native listings will appear here.
          </p>
        </div>
      )}

      {!loading && !error && leads.length > 0 && (
        <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-sm)]">
          <ul className="divide-y divide-border">
            {leads.map((lead) => (
              <li key={lead.id} className="flex items-start gap-4 px-5 py-4 hover:bg-surface-0">
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink-900">
                    {lead.listing
                      ? `${lead.listing.make} ${lead.listing.model}${lead.listing.derivative ? ` ${lead.listing.derivative}` : ""}`
                      : lead.listingRef}
                  </p>
                  <p className="mt-0.5 text-[var(--text-sm)] text-ink-500">
                    {lead.name} · {lead.contact} · {timeAgo(lead.createdAt)}
                  </p>
                  {lead.message && (
                    <p className="mt-1 line-clamp-2 text-[var(--text-xs)] text-ink-400">{lead.message}</p>
                  )}
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[var(--text-xs)] font-semibold ${CHANNEL_COLOR[lead.channel] ?? "bg-surface-2 text-ink-600"}`}>
                  {lead.channel}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
