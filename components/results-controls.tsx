"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { DEFAULT_TERMS, TERM_OPTIONS, monthlyForTerms, type FinanceTerms, type PayMode } from "@/lib/finance";

/* =============================================================================
   RESULTS BAR CONTROLS
   - ViewToggle: Grid | Map (prominent segmented control; ?view=map)
   - PayToggle:  Cash | Finance | Both (+ "Adjust" deposit / term / APR sliders)
   Both persist in the URL, so a result view is shareable and server-rendered.
   ============================================================================= */

function useUrlUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();
  return (mutate: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(sp.toString());
    mutate(p);
    p.delete("page"); // a different view / price basis starts again at page 1
    const qs = p.toString();
    startTransition(() => router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false }));
  };
}

const SEG_WRAP = "inline-flex rounded-[var(--radius-lg)] border border-border bg-surface-1 p-1";
const seg = (active: boolean) =>
  `flex items-center gap-1.5 rounded-[var(--radius-md)] px-3.5 py-1.5 text-[length:var(--text-sm)] font-semibold transition-colors ${
    active ? "bg-ink-900 text-white shadow-[var(--shadow-xs)]" : "text-ink-600 hover:text-ink-900"
  }`;

export function ViewToggle({ view, gridHref, mapHref }: { view: "grid" | "map"; gridHref: string; mapHref: string }) {
  return (
    <div className={SEG_WRAP} role="group" aria-label="Results view">
      <Link href={gridHref} scroll={false} aria-current={view === "grid"} className={seg(view === "grid")}>
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
          <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        Grid
      </Link>
      <Link href={mapHref} scroll={false} aria-current={view === "map"} className={seg(view === "map")}>
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
          <path d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" /><path d="M9 3v15M15 6v15" />
        </svg>
        Map
      </Link>
    </div>
  );
}

export function PayToggle({ mode, terms }: { mode: PayMode; terms: FinanceTerms }) {
  const update = useUrlUpdater();
  const [adjust, setAdjust] = useState(false);
  // Slider values while the user is dragging, tagged with the URL terms they started from; once the URL catches up (terms change) the tag no longer matches and the URL wins.
  const termsKey = `${terms.depositPct}|${terms.termMonths}|${terms.apr}`;
  const [pending, setPending] = useState<{ base: string; value: FinanceTerms } | null>(null);
  const local = pending && pending.base === termsKey ? pending.value : terms;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function setMode(next: PayMode) {
    update((p) => { if (next === "cash") p.delete("pay"); else p.set("pay", next); });
  }
  function commit(next: FinanceTerms) {
    setPending({ base: termsKey, value: next });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      update((p) => {
        const setOrDel = (k: string, v: number, d: number) => (v === d ? p.delete(k) : p.set(k, String(v)));
        setOrDel("dep", next.depositPct, DEFAULT_TERMS.depositPct);
        setOrDel("term", next.termMonths, DEFAULT_TERMS.termMonths);
        setOrDel("apr", next.apr, DEFAULT_TERMS.apr);
      });
    }, 350);
  }

  const example = monthlyForTerms(10000, local);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-3">
        <div className={SEG_WRAP} role="group" aria-label="Show prices as">
          {(["cash", "finance", "both"] as const).map((m) => (
            <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} className={seg(mode === m)}>
              {m === "cash" ? "Cash" : m === "finance" ? "Finance" : "Both"}
            </button>
          ))}
        </div>
        {mode !== "cash" && (
          <button
            type="button"
            aria-expanded={adjust}
            onClick={() => setAdjust((v) => !v)}
            className="text-[length:var(--text-sm)] font-semibold text-brand-600 underline-offset-2 hover:underline"
          >
            {adjust ? "Hide" : "Adjust"} deposit, term &amp; APR
          </button>
        )}
      </div>

      {mode !== "cash" && adjust && (
        <div className="mt-3 grid gap-4 rounded-[var(--radius-lg)] border border-border bg-surface-1 p-4 sm:grid-cols-3">
          <label className="block text-[length:var(--text-xs)] font-semibold text-ink-600">
            Deposit: <span className="font-mono text-ink-900">{local.depositPct}%</span>
            <input
              type="range" min={0} max={50} step={5} value={local.depositPct}
              onChange={(e) => commit({ ...local, depositPct: Number(e.target.value) })}
              className="mt-2 w-full accent-[var(--color-brand-600)]"
            />
          </label>
          <label className="block text-[length:var(--text-xs)] font-semibold text-ink-600">
            Term
            <select
              value={local.termMonths}
              onChange={(e) => commit({ ...local, termMonths: Number(e.target.value) })}
              className="mt-2 h-9 w-full rounded-[var(--radius-md)] border border-border bg-white px-2 text-[length:var(--text-sm)] font-medium text-ink-900"
            >
              {TERM_OPTIONS.map((t) => <option key={t} value={t}>{t} months</option>)}
            </select>
          </label>
          <label className="block text-[length:var(--text-xs)] font-semibold text-ink-600">
            APR: <span className="font-mono text-ink-900">{local.apr.toFixed(1)}%</span>
            <input
              type="range" min={0} max={20} step={0.1} value={local.apr}
              onChange={(e) => commit({ ...local, apr: Number(e.target.value) })}
              className="mt-2 w-full accent-[var(--color-brand-600)]"
            />
          </label>
        </div>
      )}

      {mode !== "cash" && (
        <p className="mt-2 max-w-3xl text-[length:var(--text-xs)] leading-relaxed text-ink-500">
          <strong className="font-semibold text-ink-600">Representative example:</strong> a £10,000 van with a {local.depositPct}% deposit over {local.termMonths} months at {local.apr.toFixed(1)}% APR
          (representative) is about £{Math.round(example).toLocaleString("en-GB")} a month. Monthly figures are estimates, not an offer or a quote. Finance is subject to status and
          lender approval; the rate you are offered may differ.
        </p>
      )}
    </div>
  );
}
