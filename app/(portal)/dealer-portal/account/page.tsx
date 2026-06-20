"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type DealerAccount = {
  id: string;
  slug: string;
  name: string;
  location: string | null;
  phone: string | null;
  plan: string;
  googleRating: number | null;
};

export default function DealerAccountPage() {
  const [dealer, setDealer] = useState<DealerAccount | null>(null);
  const [listingCount, setListingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", location: "", phone: "" });

  useEffect(() => {
    fetch("/api/portal/account")
      .then((r) => r.json())
      .then((d: { dealer: DealerAccount; listingCount: number }) => {
        setDealer(d.dealer);
        setListingCount(d.listingCount);
        setForm({
          name: d.dealer.name,
          location: d.dealer.location ?? "",
          phone: d.dealer.phone ?? "",
        });
      })
      .catch(() => { /* no-op */ })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!dealer) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch("/api/portal/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json() as { dealer: DealerAccount };
      setDealer(data.dealer);
      setEditing(false);
      setSaveMsg("Saved");
      setTimeout(() => setSaveMsg(null), 3000);
    } catch {
      setSaveMsg("Failed to save — please try again");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="text-[var(--text-sm)] text-ink-400">Loading…</div>
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-[var(--radius-md)] border border-danger-500/20 bg-danger-tint px-5 py-4 text-[var(--text-sm)] text-danger-700">
          No dealer account linked to this login.
        </div>
      </div>
    );
  }

  const planLabel =
    dealer.plan === "pro" ? "Pro — £89/mo"
    : dealer.plan === "dealski" ? "Dealski — Featured"
    : dealer.plan === "basic" ? "Basic — £39/mo"
    : dealer.plan;

  const LBL = "block text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-400 mb-1";
  const INPUT = "h-11 w-full rounded-[var(--radius-md)] border border-border bg-white px-3 text-[var(--text-base)] outline-none focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/20";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {saveMsg && (
        <div className={`mb-5 rounded-[var(--radius-md)] px-4 py-3 text-[var(--text-sm)] font-semibold ${
          saveMsg === "Saved"
            ? "border border-success-200 bg-success-tint text-success-700"
            : "border border-danger-500/20 bg-danger-tint text-danger-700"
        }`}>
          {saveMsg}
        </div>
      )}

      <h1 className="mb-6 font-display text-[var(--text-2xl)] font-extrabold text-ink-900">Dealer account</h1>

      {/* Business info */}
      <section className="mb-5 rounded-[var(--radius-xl)] border border-border bg-white px-6 py-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[var(--text-xs)] font-bold uppercase tracking-widest text-ink-400">Business details</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="rounded-[var(--radius-sm)] border border-border px-3 py-1.5 text-[var(--text-xs)] font-semibold text-ink-700 hover:border-ink-400"
            >
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className={LBL}>Trading name</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={INPUT} />
            </div>
            <div>
              <label className={LBL}>Location</label>
              <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="e.g. Bridgend, Wales" className={INPUT} />
            </div>
            <div>
              <label className={LBL}>Phone</label>
              <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="e.g. 01656 507619" className={INPUT} />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving || !form.name}
                className="rounded-[var(--radius-md)] bg-brand-500 px-5 py-2.5 text-[var(--text-sm)] font-bold text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setForm({ name: dealer.name, location: dealer.location ?? "", phone: dealer.phone ?? "" });
                }}
                className="rounded-[var(--radius-md)] border border-border px-4 py-2.5 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <dl className="grid grid-cols-2 gap-3 text-[var(--text-sm)]">
            {[
              { label: "Trading name", value: dealer.name },
              { label: "Phone", value: dealer.phone ?? "—" },
              { label: "Location", value: dealer.location ?? "—" },
              { label: "Dealer URL", value: `/dealer/${dealer.slug}` },
              { label: "Vans in stock", value: listingCount },
              { label: "Google rating", value: dealer.googleRating ? `${dealer.googleRating} ★` : "—" },
            ].map((row) => (
              <div key={row.label}>
                <dt className="text-ink-400">{row.label}</dt>
                <dd className="font-semibold text-ink-800">{row.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {/* Plan */}
      <section className="mb-5 rounded-[var(--radius-xl)] border border-border bg-white px-6 py-5">
        <h2 className="mb-4 text-[var(--text-xs)] font-bold uppercase tracking-widest text-ink-400">Current plan</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-[var(--text-lg)] font-bold text-ink-900 capitalize">{dealer.plan} plan</p>
            <p className="text-[var(--text-sm)] text-ink-500">{planLabel}</p>
          </div>
          <Link href="/advertise" className="rounded-[var(--radius-md)] border border-brand-500 px-4 py-2 text-[var(--text-sm)] font-semibold text-brand-700 hover:bg-brand-tint">
            Upgrade →
          </Link>
        </div>
      </section>

      {/* Account actions */}
      <section className="rounded-[var(--radius-xl)] border border-border px-6 py-5">
        <h2 className="mb-3 text-[var(--text-xs)] font-bold uppercase tracking-widest text-ink-400">Account</h2>
        <div className="flex gap-3">
          <Link href="/sign-in" className="text-[var(--text-sm)] text-ink-500 hover:underline">Change password</Link>
          <Link href="/api/auth/signout" className="text-[var(--text-sm)] text-danger-600 hover:underline">Sign out</Link>
        </div>
      </section>
    </div>
  );
}
