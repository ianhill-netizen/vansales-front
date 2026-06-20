"use client";

import { useState } from "react";
import type { ProviderDef } from "@/lib/integrations/providers";

export type RowData = {
  provider: string;
  masked_value: string | null;
  has_value: boolean;
  base_url: string | null;
  status: "connected" | "untested" | "failed";
  last_tested_at: string | null;
  notes: string | null;
};

const STATUS_CHIP: Record<string, string> = {
  connected: "bg-success-tint text-success-700",
  untested: "bg-surface-2 text-ink-500",
  failed: "bg-red-50 text-red-600",
};
const STATUS_DOT: Record<string, string> = {
  connected: "bg-success-500",
  untested: "bg-ink-300",
  failed: "bg-red-500",
};

export function IntegrationRow({
  def,
  row,
  onSaved,
}: {
  def: ProviderDef;
  row: RowData;
  onSaved: (updated: Partial<RowData>) => void;
}) {
  const [newValue, setNewValue] = useState("");
  const [newBaseUrl, setNewBaseUrl] = useState(row.base_url ?? "");
  const [status, setStatus] = useState(row.status);
  const [maskedValue, setMaskedValue] = useState(row.masked_value);
  const [hasValue, setHasValue] = useState(row.has_value);
  const [lastTested, setLastTested] = useState(row.last_tested_at);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  function showToast(ok: boolean, msg: string) {
    setToast({ ok, msg });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/integrations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: def.provider,
          value: newValue || undefined,
          base_url: newBaseUrl || null,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (data.ok) {
        if (newValue) {
          const masked = newValue.length <= 4 ? "••••" : `••••${newValue.slice(-4)}`;
          setMaskedValue(masked);
          setHasValue(true);
          setNewValue("");
        }
        setStatus("untested");
        showToast(true, "Saved successfully");
        onSaved({ status: "untested", has_value: true, base_url: newBaseUrl || null });
      } else {
        showToast(false, data.error ?? "Save failed");
      }
    } catch {
      showToast(false, "Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    try {
      const res = await fetch("/api/admin/integrations/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: def.provider }),
      });
      const data = (await res.json()) as { ok?: boolean; status?: string; message?: string };
      if (data.ok) {
        const newStatus = data.status as "connected" | "failed";
        setStatus(newStatus);
        setLastTested(new Date().toISOString());
        showToast(newStatus === "connected", data.message ?? "");
        onSaved({ status: newStatus, last_tested_at: new Date().toISOString() });
      } else {
        showToast(false, data.message ?? "Test failed");
      }
    } catch {
      showToast(false, "Network error");
    } finally {
      setTesting(false);
    }
  }

  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-white px-5 py-5 shadow-[var(--shadow-xs)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display font-bold text-ink-900">{def.label}</h3>
          <p className="mt-0.5 text-[var(--text-xs)] text-ink-500">{def.description}</p>
        </div>
        <span className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[var(--text-2xs)] font-semibold ${STATUS_CHIP[status]}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} aria-hidden />
          {statusLabel}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {/* Value field */}
        <div>
          <label className="mb-1 block text-[var(--text-2xs)] font-semibold uppercase tracking-wider text-ink-400">
            {def.valueLabel ?? "Value"}
            {hasValue && maskedValue && (
              <span className="ml-2 font-mono font-normal normal-case text-ink-400">{maskedValue}</span>
            )}
          </label>
          <input
            type="password"
            autoComplete="off"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={hasValue ? "Paste new value to replace" : def.valuePlaceholder}
            className="h-10 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 font-mono text-[var(--text-sm)] text-ink-800 outline-none placeholder:text-ink-300 focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/20"
          />
        </div>

        {/* Base URL field — Dealski only */}
        {def.hasBaseUrl && (
          <div>
            <label className="mb-1 block text-[var(--text-2xs)] font-semibold uppercase tracking-wider text-ink-400">
              {def.baseUrlLabel ?? "Base URL"}
            </label>
            <input
              type="url"
              value={newBaseUrl}
              onChange={(e) => setNewBaseUrl(e.target.value)}
              placeholder={def.baseUrlPlaceholder}
              className="h-10 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-sm)] text-ink-800 outline-none placeholder:text-ink-300 focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/20"
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-[var(--radius-md)] bg-brand-600 px-4 py-2 text-[var(--text-xs)] font-bold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={handleTest}
          disabled={testing}
          className="rounded-[var(--radius-md)] border border-border px-4 py-2 text-[var(--text-xs)] font-semibold text-ink-600 hover:border-brand-400 hover:text-brand-600 disabled:opacity-50"
        >
          {testing ? "Testing…" : "Test connection"}
        </button>
        {lastTested && (
          <span className="text-[var(--text-2xs)] text-ink-400">
            Last tested {new Date(lastTested).toLocaleString("en-GB")}
          </span>
        )}
      </div>

      {toast && (
        <div className={`mt-3 rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-xs)] font-medium ${toast.ok ? "bg-success-tint text-success-700" : "bg-red-50 text-red-600"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
