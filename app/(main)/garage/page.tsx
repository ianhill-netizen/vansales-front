"use client";

import { useState, useEffect, useRef, type SVGProps, type ReactElement } from "react";
import { Container, Button } from "@/components/ui";
import {
  IconTruck,
  IconMessage,
  IconSync,
  IconLeads,
  IconList,
  IconPlus,
  IconX,
  IconCheck,
  IconChevronLeft,
  IconChevronLeft as IconBack,
  IconShield,
} from "@/components/icons";
import { fetchGarage, initiateGarageTopUp } from "@/lib/garage/api";
import type {
  GarageData,
  GarageVehicle,
  MessageThread,
  MessageEntry,
  PxOffer,
  GarageDocument,
  ContactPref,
  WalletLedgerEntry,
  VehicleStatus,
} from "@/lib/garage/types";

// ── Extra inline icons ────────────────────────────────────────────────────────

const svgBase = {
  width: 20, height: 20, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 1.7,
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
};

function IconWallet(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...p}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 14a1 1 0 100 2 1 1 0 000-2z" fill="currentColor" stroke="none" />
      <path d="M2 11h20M6 7V5a2 2 0 012-2h8a2 2 0 012 2v2" />
    </svg>
  );
}

function IconDoc(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...p}>
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </svg>
  );
}

function IconUpload(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...p}>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <path d="M17 8l-5-5-5 5M12 3v12" />
    </svg>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function SectionHeader({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-[var(--text-sm)] font-semibold text-ink-500 hover:text-ink-800"
      >
        <IconChevronLeft width={16} height={16} />
        My Garage
      </button>
      <span className="text-ink-300">/</span>
      <span className="text-[var(--text-sm)] font-semibold text-ink-800">{title}</span>
    </div>
  );
}

function StatusPill({ status }: { status: VehicleStatus }) {
  const map: Record<VehicleStatus, string> = {
    draft:  "bg-surface-2 text-ink-500",
    listed: "bg-success-tint text-success-700",
    sold:   "bg-red-50 text-red-600",
  };
  const labels: Record<VehicleStatus, string> = {
    draft: "Draft",
    listed: "Listed on Vansales",
    sold: "Sold",
  };
  return (
    <span className={`inline-flex rounded-[var(--radius-pill)] px-2.5 py-0.5 text-[var(--text-2xs)] font-semibold ${map[status]}`}>
      {labels[status]}
    </span>
  );
}

// ── 1. VEHICLES VIEW ──────────────────────────────────────────────────────────

const TOP_UP_PACKS = [
  { key: "starter", label: "Starter",  tokens: 1_000,  price_gbp: 10,  bonus_pct: null },
  { key: "plus",    label: "Plus",     tokens: 2_500,  price_gbp: 22,  bonus_pct: 14 },
  { key: "pro",     label: "Pro",      tokens: 6_000,  price_gbp: 48,  bonus_pct: 25 },
  { key: "bulk",    label: "Bulk",     tokens: 25_000, price_gbp: 175, bonus_pct: 43 },
];

const LOOKUP_RESULT = { make: "Volkswagen", model: "Transporter", derivative: "T30 TDI 150", year: 2021 };

function AddVehicleModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (v: GarageVehicle) => void;
}) {
  const [reg, setReg] = useState("");
  const [looked, setLooked] = useState(false);
  const [looking, setLooking] = useState(false);
  const [autofill, setAutofill] = useState<typeof LOOKUP_RESULT | null>(null);
  const [mileage, setMileage] = useState("");
  const [price, setPrice] = useState("");

  function handleLookup() {
    if (!reg.trim()) return;
    setLooking(true);
    setTimeout(() => {
      setAutofill(LOOKUP_RESULT);
      setLooked(true);
      setLooking(false);
    }, 800);
  }

  function handleAdd() {
    if (!autofill || !mileage) return;
    const vehicle: GarageVehicle = {
      id: `v${Date.now()}`,
      make: autofill.make,
      model: autofill.model,
      derivative: autofill.derivative,
      year: autofill.year,
      reg: reg.trim().toUpperCase(),
      mileage: parseInt(mileage, 10) || 0,
      price: price ? parseInt(price, 10) : null,
      status: "draft",
      listed_on_vansales: false,
      image_url: null,
      slug: null,
    };
    onAdd(vehicle);
    onClose();
  }

  const inputCls = "h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 text-[var(--text-base)] text-ink-800 outline-none transition-colors focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/20";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/60 backdrop-blur-sm sm:items-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-t-[var(--radius-2xl)] bg-white p-6 shadow-[var(--shadow-lg)] sm:rounded-[var(--radius-2xl)]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-[var(--text-lg)] font-bold text-ink-900">Add vehicle</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700"><IconX width={20} height={20} /></button>
        </div>

        <div className="space-y-4">
          {/* Reg lookup */}
          <div>
            <label className="mb-1 block text-[var(--text-2xs)] font-semibold uppercase tracking-wider text-ink-500">
              Registration number
            </label>
            <div className="flex gap-2">
              <input
                value={reg}
                onChange={(e) => { setReg(e.target.value); setLooked(false); setAutofill(null); }}
                placeholder="e.g. WX71 ABC"
                className={`${inputCls} flex-1 font-mono uppercase`}
              />
              <button
                onClick={handleLookup}
                disabled={!reg.trim() || looking}
                className="h-11 rounded-[var(--radius-md)] bg-brand-500 px-4 text-[var(--text-sm)] font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {looking ? "…" : "Look up"}
              </button>
            </div>
          </div>

          {/* Autofill result */}
          {autofill && (
            <div className="rounded-[var(--radius-md)] border border-success-500/30 bg-success-tint px-4 py-3">
              <p className="text-[var(--text-xs)] font-semibold uppercase tracking-wider text-success-700">Found</p>
              <p className="mt-0.5 font-semibold text-ink-900">
                {autofill.year} {autofill.make} {autofill.model}
              </p>
              <p className="text-[var(--text-sm)] text-ink-500">{autofill.derivative}</p>
            </div>
          )}

          {/* Mileage + price — shown once lookup is done */}
          {looked && (
            <>
              <div>
                <label className="mb-1 block text-[var(--text-2xs)] font-semibold uppercase tracking-wider text-ink-500">
                  Mileage
                </label>
                <input
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  placeholder="e.g. 45000"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1 block text-[var(--text-2xs)] font-semibold uppercase tracking-wider text-ink-500">
                  Asking price (£)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 14995"
                  className={inputCls}
                />
              </div>

              {/* Photo placeholder */}
              <div>
                <label className="mb-1 block text-[var(--text-2xs)] font-semibold uppercase tracking-wider text-ink-500">
                  Photos
                </label>
                <div className="flex h-24 w-full cursor-not-allowed items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-border bg-surface-1 text-[var(--text-sm)] text-ink-400">
                  <IconUpload width={18} height={18} />
                  Photo upload — coming soon
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-[var(--radius-md)] border border-border py-2.5 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!autofill || !mileage}
            className="flex-1 rounded-[var(--radius-md)] bg-accent-500 py-2.5 text-[var(--text-sm)] font-semibold text-white transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add vehicle
          </button>
        </div>
      </div>
    </div>
  );
}

function VehiclesView({
  vehicles,
  onToggleListed,
  onAddVehicle,
  onBack,
}: {
  vehicles: GarageVehicle[];
  onToggleListed: (id: string) => void;
  onAddVehicle: (v: GarageVehicle) => void;
  onBack: () => void;
}) {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <Container className="py-10">
      <SectionHeader onBack={onBack} title="My Vehicles" />

      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-[var(--text-2xl)] font-extrabold text-ink-900">My Vehicles</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-[var(--radius-md)] bg-accent-500 px-4 py-2 text-[var(--text-sm)] font-semibold text-white hover:bg-accent-600"
        >
          <IconPlus width={16} height={16} />
          Add vehicle
        </button>
      </div>

      <div className="space-y-3">
        {vehicles.map((v) => (
          <div
            key={v.id}
            className="flex items-center gap-4 rounded-[var(--radius-xl)] border border-border bg-white px-5 py-4 shadow-[var(--shadow-sm)]"
          >
            {/* Photo placeholder */}
            <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-surface-1">
              <svg viewBox="0 0 64 32" fill="none" className="h-8 w-16 text-ink-200" aria-hidden>
                <rect x="1" y="11" width="62" height="18" rx="3" stroke="currentColor" strokeWidth="2" />
                <rect x="8" y="3" width="28" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                <circle cx="14" cy="29" r="3" stroke="currentColor" strokeWidth="2" />
                <circle cx="50" cy="29" r="3" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-ink-900">
                  {v.year} {v.make} {v.model}
                </p>
                <StatusPill status={v.status} />
              </div>
              <p className="mt-0.5 font-mono text-[var(--text-sm)] font-semibold text-ink-500">{v.reg}</p>
              <p className="text-[var(--text-xs)] text-ink-400">
                {v.mileage.toLocaleString("en-GB")} mi
                {v.price != null ? ` · £${v.price.toLocaleString("en-GB")}` : " · Price TBC"}
              </p>
            </div>

            {/* List on Vansales toggle */}
            {v.status !== "sold" && (
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <p className="text-[var(--text-2xs)] font-semibold uppercase tracking-wider text-ink-400">
                  List on Vansales
                </p>
                <button
                  role="switch"
                  aria-checked={v.listed_on_vansales}
                  onClick={() => onToggleListed(v.id)}
                  className={`relative h-6 w-11 rounded-full transition-colors duration-[var(--dur-base)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 ${
                    v.listed_on_vansales ? "bg-brand-500" : "bg-surface-3"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-[var(--dur-base)] ${
                      v.listed_on_vansales ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            )}
          </div>
        ))}

        {vehicles.length === 0 && (
          <p className="rounded-[var(--radius-xl)] border border-dashed border-border bg-white py-10 text-center text-[var(--text-sm)] text-ink-400">
            No vehicles yet.{" "}
            <button onClick={() => setShowAdd(true)} className="text-brand-600 hover:underline">
              Add your first one →
            </button>
          </p>
        )}
      </div>

      {showAdd && <AddVehicleModal onClose={() => setShowAdd(false)} onAdd={onAddVehicle} />}
    </Container>
  );
}

// ── 2. WALLET VIEW ────────────────────────────────────────────────────────────

function TopUpModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected]       = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError]             = useState<string | null>(null);

  async function handleContinue() {
    if (!selected) return;
    setRedirecting(true);
    setError(null);
    try {
      const returnUrl = typeof window !== "undefined" ? window.location.href : "";
      const { checkout_url } = await initiateGarageTopUp(selected, returnUrl);
      window.location.href = checkout_url;
    } catch {
      setError("Failed to start checkout — please try again.");
      setRedirecting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/60 backdrop-blur-sm sm:items-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-t-[var(--radius-2xl)] bg-white p-6 shadow-[var(--shadow-lg)] sm:rounded-[var(--radius-2xl)]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-[var(--text-lg)] font-bold text-ink-900">Top up tokens</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700"><IconX width={20} height={20} /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {TOP_UP_PACKS.map((pack) => (
            <button
              key={pack.key}
              onClick={() => setSelected(pack.key)}
              className={`rounded-[var(--radius-lg)] border p-4 text-left transition-colors ${
                selected === pack.key
                  ? "border-brand-500 bg-brand-500/10"
                  : "border-border bg-white hover:bg-surface-0"
              }`}
            >
              <p className="font-display font-bold text-ink-900">{pack.label}</p>
              <p className="mt-0.5 text-[var(--text-sm)] text-ink-500">
                {pack.tokens.toLocaleString("en-GB")} tokens
              </p>
              <p className="mt-1 font-semibold text-ink-800">£{pack.price_gbp}</p>
              {pack.bonus_pct && (
                <span className="mt-1 inline-block rounded-full border border-success-500/20 bg-success-tint px-2 py-0.5 text-[var(--text-2xs)] font-semibold text-success-700">
                  +{pack.bonus_pct}% bonus
                </span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-3 text-center text-[var(--text-xs)] text-red-500">{error}</p>
        )}
        <button
          disabled={!selected || redirecting}
          onClick={handleContinue}
          className="mt-5 w-full rounded-[var(--radius-md)] bg-accent-500 py-3 text-[var(--text-base)] font-semibold text-white transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {redirecting ? "Redirecting…" : selected ? "Continue to payment" : "Select a pack"}
        </button>
      </div>
    </div>
  );
}

function WalletView({
  tokens,
  ledger,
  onBack,
}: {
  tokens: number;
  ledger: WalletLedgerEntry[];
  onBack: () => void;
}) {
  const [showTopUp, setShowTopUp] = useState(false);

  const ACTION_COSTS = [
    { action: "List a vehicle",  tokens: 0,  note: "Always free" },
    { action: "Image enhance",   tokens: 50, note: null },
    { action: "Send message",    tokens: 1,  note: null },
  ];

  return (
    <Container className="py-10">
      <SectionHeader onBack={onBack} title="Wallet" />

      {/* Balance header */}
      <div className="mb-6 flex items-start justify-between rounded-[var(--radius-xl)] border border-border bg-white px-6 py-5 shadow-[var(--shadow-sm)]">
        <div>
          <p className="text-[var(--text-xs)] font-semibold uppercase tracking-wider text-ink-400">Token balance</p>
          <p className="mt-1 font-display text-[var(--text-3xl)] font-extrabold text-ink-900">
            {tokens.toLocaleString("en-GB")}
            <span className="ml-1 text-[var(--text-base)] font-normal text-ink-400">tokens</span>
          </p>
          <p className="mt-0.5 text-[var(--text-sm)] text-ink-500">
            £{(tokens / 100).toFixed(2)} equivalent · 1 token = 1p
          </p>
        </div>
        <button
          onClick={() => setShowTopUp(true)}
          className="rounded-[var(--radius-md)] bg-accent-500 px-4 py-2 text-[var(--text-sm)] font-semibold text-white hover:bg-accent-600"
        >
          Top up
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Action costs */}
        <section>
          <h2 className="mb-3 font-display text-[var(--text-base)] font-bold text-ink-900">Action costs</h2>
          <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white">
            <table className="w-full text-[var(--text-sm)]">
              <thead>
                <tr className="border-b border-border bg-surface-0">
                  <th className="px-4 py-2.5 text-left text-[var(--text-xs)] font-semibold uppercase tracking-wider text-ink-400">Action</th>
                  <th className="px-4 py-2.5 text-right text-[var(--text-xs)] font-semibold uppercase tracking-wider text-ink-400">Tokens</th>
                  <th className="px-4 py-2.5 text-right text-[var(--text-xs)] font-semibold uppercase tracking-wider text-ink-400">£</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ACTION_COSTS.map((row) => (
                  <tr key={row.action} className="hover:bg-surface-0">
                    <td className="px-4 py-3 font-medium text-ink-800">{row.action}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-ink-800">
                      {row.tokens === 0 ? (
                        <span className="text-success-600">Free</span>
                      ) : (
                        row.tokens
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-ink-500">
                      {row.tokens === 0 ? "—" : `£${(row.tokens / 100).toFixed(2)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Ledger */}
        <section>
          <h2 className="mb-3 font-display text-[var(--text-base)] font-bold text-ink-900">Recent activity</h2>
          <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white">
            <table className="w-full text-[var(--text-sm)]">
              <thead>
                <tr className="border-b border-border bg-surface-0">
                  <th className="px-4 py-2.5 text-left text-[var(--text-xs)] font-semibold uppercase tracking-wider text-ink-400">Date</th>
                  <th className="px-4 py-2.5 text-left text-[var(--text-xs)] font-semibold uppercase tracking-wider text-ink-400">Action</th>
                  <th className="px-4 py-2.5 text-right text-[var(--text-xs)] font-semibold uppercase tracking-wider text-ink-400">Tokens</th>
                  <th className="px-4 py-2.5 text-right text-[var(--text-xs)] font-semibold uppercase tracking-wider text-ink-400">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ledger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-surface-0">
                    <td className="px-4 py-3 font-mono text-[var(--text-xs)] text-ink-500">{entry.date}</td>
                    <td className="px-4 py-3 text-ink-700">{entry.action}</td>
                    <td className={`px-4 py-3 text-right font-mono font-semibold ${entry.tokens > 0 ? "text-success-600" : "text-red-500"}`}>
                      {entry.tokens > 0 ? `+${entry.tokens}` : entry.tokens}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-ink-500">{entry.running_balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)} />}
    </Container>
  );
}

// ── 3. MESSAGING VIEW ─────────────────────────────────────────────────────────

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHrs = diffMs / 3_600_000;
  if (diffHrs < 24) return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function ThreadView({
  thread,
  onBack,
  tokens,
  onSend,
}: {
  thread: MessageThread;
  onBack: () => void;
  tokens: number;
  onSend: (body: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.messages.length]);

  function handleSend() {
    const body = draft.trim();
    if (!body) return;
    onSend(body);
    setDraft("");
  }

  return (
    <Container className="py-10">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[var(--text-sm)] font-semibold text-ink-500 hover:text-ink-800"
        >
          <IconChevronLeft width={16} height={16} />
          Messages
        </button>
        <span className="text-ink-300">/</span>
        <span className="text-[var(--text-sm)] font-semibold text-ink-800">{thread.buyer_name}</span>
      </div>

      <div className="rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-sm)]">
        {/* Thread header */}
        <div className="border-b border-border px-5 py-4">
          <p className="font-semibold text-ink-900">{thread.buyer_name}</p>
          <p className="text-[var(--text-xs)] text-ink-400">re: {thread.vehicle}</p>
        </div>

        {/* Messages */}
        <div className="max-h-[400px] space-y-3 overflow-y-auto px-5 py-4">
          {thread.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.from === "seller" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs rounded-[var(--radius-lg)] px-4 py-2.5 text-[var(--text-sm)] ${
                  msg.from === "seller"
                    ? "bg-brand-500 text-white"
                    : "bg-surface-1 text-ink-800"
                }`}
              >
                <p>{msg.body}</p>
                <p className={`mt-1 text-[var(--text-2xs)] ${msg.from === "seller" ? "text-blue-100" : "text-ink-400"}`}>
                  {formatTime(msg.sent_at)}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Compose */}
        <div className="border-t border-border px-5 py-4">
          <div className="flex gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              rows={2}
              placeholder="Type a reply…"
              className="flex-1 resize-none rounded-[var(--radius-md)] border border-border bg-surface-0 px-3 py-2 text-[var(--text-sm)] text-ink-800 outline-none transition-colors focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/20"
            />
            <button
              onClick={handleSend}
              disabled={!draft.trim()}
              className="self-end rounded-[var(--radius-md)] bg-brand-500 px-4 py-2 text-[var(--text-sm)] font-semibold text-white hover:bg-brand-600 disabled:opacity-40"
            >
              Send
            </button>
          </div>
          <p className="mt-1.5 text-[var(--text-2xs)] text-ink-400">
            Sending costs 1 token · you have {tokens} token{tokens !== 1 ? "s" : ""} remaining
          </p>
        </div>
      </div>
    </Container>
  );
}

function MessagingView({
  initialThreads,
  contactPref: initialPref,
  tokens,
  onSpendToken,
  onBack,
}: {
  initialThreads: MessageThread[];
  contactPref: ContactPref;
  tokens: number;
  onSpendToken: () => void;
  onBack: () => void;
}) {
  const [threads, setThreads] = useState(initialThreads);
  const [pref, setPref] = useState<ContactPref>(initialPref);
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeThread = threads.find((t) => t.id === activeId);

  function handleSend(body: string) {
    if (!activeId) return;
    const newMsg: MessageEntry = {
      id: `m${Date.now()}`,
      from: "seller",
      body,
      sent_at: new Date().toISOString(),
    };
    setThreads((ts) =>
      ts.map((t) =>
        t.id === activeId
          ? { ...t, messages: [...t.messages, newMsg], last_message: body, last_message_at: newMsg.sent_at, unread: 0 }
          : t
      )
    );
    onSpendToken();
  }

  if (activeThread) {
    return (
      <ThreadView
        thread={activeThread}
        onBack={() => setActiveId(null)}
        tokens={tokens}
        onSend={handleSend}
      />
    );
  }

  const PREFS: { key: ContactPref; label: string; desc: string; disabled?: boolean }[] = [
    { key: "platform", label: "In-platform messaging", desc: "Buyers message you here. Your number stays private." },
    { key: "reveal_number", label: "Reveal my number", desc: "Your phone number is shown on your listing." },
    { key: "masked_number", label: "Masked number", desc: "A Vansales number forwards calls to you.", disabled: true },
  ];

  return (
    <Container className="py-10">
      <SectionHeader onBack={onBack} title="Messaging" />

      <h1 className="mb-6 font-display text-[var(--text-2xl)] font-extrabold text-ink-900">Messaging</h1>

      {/* Contact preference */}
      <section className="mb-6 rounded-[var(--radius-xl)] border border-border bg-white px-5 py-5 shadow-[var(--shadow-sm)]">
        <h2 className="mb-3 font-display text-[var(--text-base)] font-bold text-ink-900">Contact preference</h2>
        <div className="space-y-2">
          {PREFS.map((option) => (
            <label
              key={option.key}
              className={`flex cursor-pointer items-start gap-3 rounded-[var(--radius-lg)] border px-4 py-3 transition-colors ${
                option.disabled
                  ? "cursor-not-allowed border-border bg-surface-0 opacity-50"
                  : pref === option.key
                    ? "border-brand-500 bg-brand-500/5"
                    : "border-border hover:bg-surface-0"
              }`}
            >
              <input
                type="radio"
                name="contact_pref"
                value={option.key}
                checked={pref === option.key}
                disabled={option.disabled}
                onChange={() => setPref(option.key)}
                className="mt-0.5 accent-brand-500"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink-900">{option.label}</span>
                  {option.disabled && (
                    <span className="rounded-[var(--radius-pill)] bg-amber-50 px-2 py-0.5 text-[var(--text-2xs)] font-semibold text-amber-600">
                      Coming soon
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[var(--text-xs)] text-ink-500">{option.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Thread list */}
      <section>
        <h2 className="mb-3 font-display text-[var(--text-base)] font-bold text-ink-900">Conversations</h2>
        <div className="space-y-2">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setActiveId(thread.id)}
              className="flex w-full items-center gap-4 rounded-[var(--radius-xl)] border border-border bg-white px-5 py-4 text-left shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink-900 font-display text-[var(--text-sm)] font-bold text-white">
                {thread.buyer_name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-ink-900">{thread.buyer_name}</p>
                  {thread.unread > 0 && (
                    <span className="rounded-full bg-brand-500 px-1.5 py-0.5 text-[var(--text-2xs)] font-bold text-white">
                      {thread.unread}
                    </span>
                  )}
                </div>
                <p className="truncate text-[var(--text-xs)] text-ink-400">{thread.last_message}</p>
                <p className="text-[var(--text-2xs)] text-ink-300">{thread.vehicle}</p>
              </div>
              <p className="shrink-0 text-[var(--text-xs)] text-ink-400">{formatTime(thread.last_message_at)}</p>
            </button>
          ))}

          {threads.length === 0 && (
            <p className="rounded-[var(--radius-xl)] border border-dashed border-border bg-white py-10 text-center text-[var(--text-sm)] text-ink-400">
              No messages yet.
            </p>
          )}
        </div>
      </section>
    </Container>
  );
}

// ── 4. PX OFFERS VIEW ────────────────────────────────────────────────────────

function PxOffersView({
  initialOffers,
  onBack,
}: {
  initialOffers: PxOffer[];
  onBack: () => void;
}) {
  const [offers, setOffers] = useState(initialOffers);

  function handleAction(id: string, action: "accepted" | "declined") {
    setOffers((os) => os.map((o) => (o.id === id ? { ...o, status: action } : o)));
  }

  return (
    <Container className="py-10">
      <SectionHeader onBack={onBack} title="PX Offers" />

      <h1 className="mb-6 font-display text-[var(--text-2xl)] font-extrabold text-ink-900">PX Offers</h1>

      <div className="space-y-3">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="rounded-[var(--radius-xl)] border border-border bg-white px-5 py-5 shadow-[var(--shadow-sm)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-ink-900">{offer.dealer_name}</p>
                  {offer.status !== "pending" && (
                    <span className={`rounded-full px-2.5 py-0.5 text-[var(--text-2xs)] font-semibold ${
                      offer.status === "accepted" ? "bg-success-tint text-success-700" : "bg-red-50 text-red-600"
                    }`}>
                      {offer.status === "accepted" ? "Accepted" : "Declined"}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[var(--text-sm)] text-ink-500">{offer.vehicle}</p>
                <p className="text-[var(--text-xs)] text-ink-400">{offer.date}</p>
              </div>
              <p className="font-display text-[var(--text-xl)] font-extrabold text-ink-900">
                £{offer.offer_amount.toLocaleString("en-GB")}
              </p>
            </div>

            {offer.status === "pending" && (
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => handleAction(offer.id, "accepted")}
                  className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-success-600 px-4 py-2 text-[var(--text-sm)] font-semibold text-white hover:bg-success-700"
                >
                  <IconCheck width={16} height={16} />
                  Accept
                </button>
                <button
                  onClick={() => handleAction(offer.id, "declined")}
                  className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border px-4 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-red-300 hover:text-red-500"
                >
                  <IconX width={16} height={16} />
                  Decline
                </button>
              </div>
            )}
          </div>
        ))}

        {offers.length === 0 && (
          <p className="rounded-[var(--radius-xl)] border border-dashed border-border bg-white py-10 text-center text-[var(--text-sm)] text-ink-400">
            No PX offers yet. List a vehicle to start receiving offers.
          </p>
        )}
      </div>
    </Container>
  );
}

// ── 5. MULTI-PX VIEW ─────────────────────────────────────────────────────────

const BATCH_COST_PER_VEHICLE = 5;

function MultiPxView({
  vehicles,
  tokens,
  onSpendTokens,
  onBack,
}: {
  vehicles: GarageVehicle[];
  tokens: number;
  onSpendTokens: (n: number) => void;
  onBack: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);
  const [sent, setSent] = useState(false);

  const activeVehicles = vehicles.filter((v) => v.status !== "sold");
  const count = selected.size;
  const cost = count * BATCH_COST_PER_VEHICLE;
  const canAfford = tokens >= cost && cost > 0;

  function toggleVehicle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handleConfirm() {
    onSpendTokens(cost);
    setSent(true);
    setConfirming(false);
  }

  return (
    <Container className="py-10">
      <SectionHeader onBack={onBack} title="Batch PX" />

      <h1 className="mb-2 font-display text-[var(--text-2xl)] font-extrabold text-ink-900">Batch PX Request</h1>
      <p className="mb-6 text-[var(--text-sm)] text-ink-500">
        Select vehicles and send a part-exchange request to the dealer network. Costs {BATCH_COST_PER_VEHICLE} tokens per vehicle.
      </p>

      {sent ? (
        <div className="flex items-start gap-4 rounded-[var(--radius-xl)] border border-success-500/30 bg-success-tint px-6 py-5">
          <IconCheck width={24} height={24} className="mt-0.5 shrink-0 text-success-600" />
          <div>
            <p className="font-semibold text-success-700">Batch PX request sent!</p>
            <p className="mt-0.5 text-[var(--text-sm)] text-ink-600">
              Your request has been submitted to the dealer network. Offers will arrive in PX Offers.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Vehicle checklist */}
          <div className="mb-4 space-y-2">
            {activeVehicles.map((v) => (
              <label
                key={v.id}
                className="flex cursor-pointer items-center gap-4 rounded-[var(--radius-xl)] border border-border bg-white px-5 py-4 shadow-[var(--shadow-sm)] hover:bg-surface-0"
              >
                <input
                  type="checkbox"
                  checked={selected.has(v.id)}
                  onChange={() => toggleVehicle(v.id)}
                  className="h-4 w-4 rounded accent-brand-500"
                />
                <div>
                  <p className="font-semibold text-ink-900">
                    {v.year} {v.make} {v.model}
                  </p>
                  <p className="font-mono text-[var(--text-xs)] text-ink-400">
                    {v.reg} · {v.mileage.toLocaleString("en-GB")} mi
                  </p>
                </div>
              </label>
            ))}
            {activeVehicles.length === 0 && (
              <p className="text-[var(--text-sm)] text-ink-400">No active vehicles to select.</p>
            )}
          </div>

          {/* Cost preview + confirm */}
          {count > 0 && (
            <div className="rounded-[var(--radius-xl)] border border-border bg-white px-5 py-4 shadow-[var(--shadow-sm)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[var(--text-sm)] text-ink-600">
                    {count} vehicle{count !== 1 ? "s" : ""} × {BATCH_COST_PER_VEHICLE} tokens
                  </p>
                  <p className="font-display text-[var(--text-lg)] font-bold text-ink-900">
                    Total: {cost} tokens (£{(cost / 100).toFixed(2)})
                  </p>
                  {!canAfford && (
                    <p className="mt-1 text-[var(--text-xs)] text-red-500">Insufficient tokens — top up your wallet first.</p>
                  )}
                </div>
                {!confirming ? (
                  <button
                    onClick={() => setConfirming(true)}
                    disabled={!canAfford}
                    className="rounded-[var(--radius-md)] bg-accent-500 px-5 py-2.5 text-[var(--text-sm)] font-semibold text-white hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Send batch PX
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirming(false)}
                      className="rounded-[var(--radius-md)] border border-border px-4 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="rounded-[var(--radius-md)] bg-brand-500 px-4 py-2 text-[var(--text-sm)] font-semibold text-white hover:bg-brand-600"
                    >
                      Confirm & send
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </Container>
  );
}

// ── 6. DOCUMENTS VIEW ────────────────────────────────────────────────────────

function UploadDocModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/60 backdrop-blur-sm sm:items-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-t-[var(--radius-2xl)] bg-white p-6 shadow-[var(--shadow-lg)] sm:rounded-[var(--radius-2xl)]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-[var(--text-lg)] font-bold text-ink-900">Upload document</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700"><IconX width={20} height={20} /></button>
        </div>
        <div className="flex h-32 w-full cursor-not-allowed items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-border bg-surface-1 text-[var(--text-sm)] text-ink-400">
          <IconUpload width={20} height={20} />
          Document upload — coming soon
        </div>
        <button
          onClick={onClose}
          className="mt-5 w-full rounded-[var(--radius-md)] border border-border py-2.5 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400"
        >
          Close
        </button>
      </div>
    </div>
  );
}

const DOC_TYPE_STYLE: Record<string, string> = {
  warranty: "bg-brand-tint text-brand-700",
  insurance: "bg-success-tint text-success-700",
};

function DocumentsView({
  docs,
  onBack,
}: {
  docs: GarageDocument[];
  onBack: () => void;
}) {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <Container className="py-10">
      <SectionHeader onBack={onBack} title="My Documents" />

      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-[var(--text-2xl)] font-extrabold text-ink-900">My Documents</h1>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 rounded-[var(--radius-md)] border border-border px-4 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-brand-500 hover:text-brand-700"
        >
          <IconUpload width={16} height={16} />
          Upload
        </button>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-white shadow-[var(--shadow-sm)]">
        {docs.length > 0 ? (
          <table className="w-full text-[var(--text-sm)]">
            <thead>
              <tr className="border-b border-border bg-surface-0">
                <th className="px-4 py-2.5 text-left text-[var(--text-xs)] font-semibold uppercase tracking-wider text-ink-400">Name</th>
                <th className="px-4 py-2.5 text-left text-[var(--text-xs)] font-semibold uppercase tracking-wider text-ink-400">Type</th>
                <th className="px-4 py-2.5 text-left text-[var(--text-xs)] font-semibold uppercase tracking-wider text-ink-400">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {docs.map((doc) => (
                <tr key={doc.id} className="hover:bg-surface-0">
                  <td className="px-4 py-3 font-medium text-ink-800">{doc.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-[var(--radius-pill)] px-2.5 py-0.5 text-[var(--text-2xs)] font-semibold capitalize ${DOC_TYPE_STYLE[doc.type] ?? "bg-surface-2 text-ink-600"}`}>
                      {doc.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[var(--text-xs)] text-ink-500">{doc.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="py-10 text-center text-[var(--text-sm)] text-ink-400">No documents yet.</p>
        )}
      </div>

      {showUpload && <UploadDocModal onClose={() => setShowUpload(false)} />}
    </Container>
  );
}

// ── DASHBOARD LANDING ─────────────────────────────────────────────────────────

type Section = "vehicles" | "wallet" | "messaging" | "px_offers" | "multi_px" | "documents";

const CARD_COLOR: Record<string, { bg: string; text: string }> = {
  blue:   { bg: "bg-blue-50",   text: "text-blue-600" },
  green:  { bg: "bg-green-50",  text: "text-green-600" },
  purple: { bg: "bg-purple-50", text: "text-purple-600" },
  amber:  { bg: "bg-amber-50",  text: "text-amber-600" },
  orange: { bg: "bg-orange-50", text: "text-orange-600" },
  teal:   { bg: "bg-teal-50",   text: "text-teal-600" },
};

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────

export default function GaragePage() {
  const [garage, setGarage] = useState<GarageData | null>(null);
  const [section, setSection] = useState<Section | null>(null);
  const [tokens, setTokens] = useState(0);
  const [ledger, setLedger] = useState<WalletLedgerEntry[]>([]);

  useEffect(() => {
    fetchGarage().then((data) => {
      setGarage(data);
      setTokens(data.wallet.tokens);
      setLedger(data.wallet.ledger);
    });
  }, []);

  if (!garage) {
    return (
      <Container className="py-20 text-center">
        <p className="text-[var(--text-sm)] text-ink-400">Loading…</p>
      </Container>
    );
  }

  function spendTokens(amount: number, action: string) {
    const newBalance = tokens - amount;
    setTokens(newBalance);
    const entry: WalletLedgerEntry = {
      id: `l${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      action,
      tokens: -amount,
      running_balance: newBalance,
    };
    setLedger((prev) => [entry, ...prev]);
  }

  function handleToggleListed(id: string) {
    setGarage((g) => {
      if (!g) return g;
      return {
        ...g,
        vehicles: g.vehicles.map((v) =>
          v.id === id
            ? { ...v, listed_on_vansales: !v.listed_on_vansales, status: v.listed_on_vansales ? "draft" as const : "listed" as const }
            : v
        ),
      };
    });
  }

  function handleAddVehicle(v: GarageVehicle) {
    setGarage((g) => g ? { ...g, vehicles: [...g.vehicles, v] } : g);
  }

  function back() { setSection(null); }

  // ── Section routing ────────────────────────────────────────────────────────

  if (section === "vehicles") {
    return (
      <VehiclesView
        vehicles={garage.vehicles}
        onToggleListed={handleToggleListed}
        onAddVehicle={handleAddVehicle}
        onBack={back}
      />
    );
  }

  if (section === "wallet") {
    return <WalletView tokens={tokens} ledger={ledger} onBack={back} />;
  }

  if (section === "messaging") {
    return (
      <MessagingView
        initialThreads={garage.threads}
        contactPref={garage.profile.contact_pref}
        tokens={tokens}
        onSpendToken={() => spendTokens(1, "Message")}
        onBack={back}
      />
    );
  }

  if (section === "px_offers") {
    return <PxOffersView initialOffers={garage.px_offers} onBack={back} />;
  }

  if (section === "multi_px") {
    return (
      <MultiPxView
        vehicles={garage.vehicles}
        tokens={tokens}
        onSpendTokens={(n) => spendTokens(n, "Batch PX request")}
        onBack={back}
      />
    );
  }

  if (section === "documents") {
    return <DocumentsView docs={garage.documents} onBack={back} />;
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────

  const listedCount  = garage.vehicles.filter((v) => v.status === "listed").length;
  const unread       = garage.threads.reduce((s, t) => s + t.unread, 0);
  const pendingOffers = garage.px_offers.filter((o) => o.status === "pending").length;

  const CARDS: { id: Section; title: string; stat: string; Icon: (p: SVGProps<SVGSVGElement>) => ReactElement; color: string }[] = [
    {
      id: "vehicles",
      title: "My Vehicles",
      stat: `${garage.vehicles.length} vehicle${garage.vehicles.length !== 1 ? "s" : ""} · ${listedCount} listed`,
      Icon: IconTruck,
      color: "blue",
    },
    {
      id: "wallet",
      title: "Wallet",
      stat: `${tokens.toLocaleString("en-GB")} tokens · £${(tokens / 100).toFixed(2)}`,
      Icon: IconWallet,
      color: "green",
    },
    {
      id: "messaging",
      title: "Messaging",
      stat: unread > 0 ? `${unread} unread` : `${garage.threads.length} thread${garage.threads.length !== 1 ? "s" : ""}`,
      Icon: IconMessage,
      color: "purple",
    },
    {
      id: "px_offers",
      title: "PX Offers",
      stat: pendingOffers > 0 ? `${pendingOffers} pending offer${pendingOffers !== 1 ? "s" : ""}` : "No pending offers",
      Icon: IconSync,
      color: "amber",
    },
    {
      id: "multi_px",
      title: "Batch PX",
      stat: `${BATCH_COST_PER_VEHICLE} tokens per vehicle`,
      Icon: IconLeads,
      color: "orange",
    },
    {
      id: "documents",
      title: "My Documents",
      stat: `${garage.documents.length} document${garage.documents.length !== 1 ? "s" : ""}`,
      Icon: IconDoc,
      color: "teal",
    },
  ];

  return (
    <Container className="py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-[var(--text-2xl)] font-extrabold text-ink-900">
            Hi, {garage.profile.name.split(" ")[0]}
          </h1>
          <p className="mt-0.5 text-[var(--text-sm)] text-ink-500">
            Private Seller · {garage.profile.email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-[var(--radius-pill)] bg-surface-2 px-3 py-1.5 text-[var(--text-xs)] font-semibold text-ink-600">
            {tokens.toLocaleString("en-GB")} tokens
          </span>
          <button className="rounded-[var(--radius-md)] border border-border px-4 py-2 text-[var(--text-sm)] font-semibold text-ink-700 hover:border-ink-400">
            Edit profile
          </button>
        </div>
      </div>

      {/* Icon-card grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {CARDS.map((card) => {
          const colors = CARD_COLOR[card.color];
          return (
            <button
              key={card.id}
              onClick={() => setSection(card.id)}
              className="group flex flex-col items-start rounded-[var(--radius-xl)] border border-border bg-white p-5 text-left shadow-[var(--shadow-sm)] transition-all duration-[var(--dur-base)] ease-[var(--ease-out)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] ${colors.bg} ${colors.text}`}>
                <card.Icon width={22} height={22} />
              </div>
              <p className="mt-3 font-display text-[var(--text-base)] font-bold text-ink-900">{card.title}</p>
              <p className="mt-0.5 text-[var(--text-xs)] text-ink-500">{card.stat}</p>
            </button>
          );
        })}
      </div>

      {/* Private seller mask reminder */}
      <div className="mt-8 flex items-center justify-center gap-2 text-[var(--text-xs)] text-ink-400">
        <IconShield width={13} height={13} className="text-ink-300" />
        You appear as <span className="font-semibold text-ink-600">&ldquo;Private seller&rdquo;</span> to all buyers — your name and contact details are never revealed.
      </div>
    </Container>
  );
}
