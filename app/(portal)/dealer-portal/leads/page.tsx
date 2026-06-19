"use client";

import Link from "next/link";
import { useRole } from "@/lib/roles/context";
import { MOCK_LEADS } from "@/lib/roles/mock-data";

const CHANNEL_COLOR: Record<string, string> = {
  WhatsApp: "bg-success-tint text-success-700",
  Message: "bg-surface-2 text-ink-600",
  Finance: "bg-amber-50 text-amber-700",
  PX: "bg-purple-50 text-purple-700",
};

export default function LeadsPage() {
  const { persona } = useRole();
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-[var(--text-2xl)] font-extrabold text-ink-900">All leads</h1>
        <span className="text-[var(--text-sm)] text-ink-500">{MOCK_LEADS.length} total</span>
      </div>
      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-sm)]">
        <ul className="divide-y divide-border">
          {MOCK_LEADS.map((lead) => (
            <li key={lead.id}
              className={`flex items-start gap-4 px-5 py-4 hover:bg-surface-0 ${!lead.read ? "bg-brand-tint/30" : ""}`}>
              {!lead.read && <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />}
              {lead.read && <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-transparent" />}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink-900">{lead.van}</p>
                <p className="mt-0.5 text-[var(--text-sm)] text-ink-500">{lead.buyer} · {lead.time}</p>
                {lead.note && <p className="mt-1 text-[var(--text-xs)] text-ink-400">{lead.note}</p>}
              </div>
              <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[var(--text-xs)] font-semibold ${CHANNEL_COLOR[lead.channel] ?? "bg-surface-2 text-ink-600"}`}>
                {lead.channel}
              </span>
              <div className="flex flex-shrink-0 items-center gap-2">
                <button className="rounded-[var(--radius-md)] border border-border px-3 py-1.5 text-[var(--text-xs)] font-semibold text-ink-700 hover:border-brand-500">
                  Reply
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
