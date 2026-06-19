"use client";

import { useState } from "react";
import Link from "next/link";

function pmt(annualRate: number, months: number, principal: number): number {
  if (principal <= 0 || months <= 0) return 0;
  if (annualRate === 0) return principal / months;
  const r = annualRate / 12 / 100;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

function fmt(n: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);
}

const TERM_OPTIONS = [24, 36, 48, 60];
const DEPOSIT_PCTS = [10, 15, 20, 25];

interface Props {
  vanPrice?: number | null;
  applyUrl?: string;
}

export function FinanceCalculator({ vanPrice, applyUrl }: Props) {
  const defaultPrice = vanPrice ?? 25000;
  const [price, setPrice] = useState(defaultPrice);
  const [depositPct, setDepositPct] = useState(20);
  const [term, setTerm] = useState(48);
  const [apr, setApr] = useState(9.9);
  const [type, setType] = useState<"hp" | "pcp">("hp");

  const deposit = Math.round((price * depositPct) / 100);
  const borrowed = price - deposit;
  const residual = type === "pcp" ? Math.round(price * 0.3) : 0;
  const financed = borrowed - residual;
  const monthly = Math.round(pmt(apr, term, financed) * 100) / 100;
  const totalRepayable = deposit + monthly * term + residual;
  const totalCostOfCredit = totalRepayable - price;

  const pill = "flex-1 rounded-[var(--radius-md)] border py-2 text-center text-[var(--text-sm)] font-semibold transition-colors";
  const activeP = "border-brand-500 bg-brand-500 text-white";
  const inactiveP = "border-border bg-white text-ink-600 hover:border-brand-500/50";

  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
      <h3 className="font-display text-[var(--text-lg)] font-bold text-ink-900">Finance calculator</h3>
      <p className="mt-0.5 text-[var(--text-xs)] text-ink-400">Illustrative only — apply for a personalised quote</p>

      {/* Finance type */}
      <div className="mt-4 flex gap-2">
        {(["hp", "pcp"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setType(t)}
            className={`${pill} ${type === t ? activeP : inactiveP}`}>
            {t === "hp" ? "Hire Purchase" : "PCP"}
          </button>
        ))}
      </div>

      {/* Van price */}
      {!vanPrice && (
        <div className="mt-4">
          <label className="block text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-500">
            Van price
          </label>
          <div className="mt-1.5 flex items-center rounded-[var(--radius-md)] border border-border bg-surface-0 px-3">
            <span className="text-ink-400">£</span>
            <input
              type="number"
              min={1000} max={150000} step={500}
              value={price}
              onChange={(e) => setPrice(Math.max(1000, Number(e.target.value) || defaultPrice))}
              className="h-10 flex-1 bg-transparent pl-2 text-[var(--text-base)] text-ink-800 outline-none"
            />
          </div>
        </div>
      )}

      {/* Deposit */}
      <div className="mt-4">
        <label className="block text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-500">
          Deposit — {depositPct}% ({fmt(deposit)})
        </label>
        <div className="mt-2 flex gap-2">
          {DEPOSIT_PCTS.map((d) => (
            <button key={d} type="button" onClick={() => setDepositPct(d)}
              className={`${pill} ${depositPct === d ? activeP : inactiveP}`}>
              {d}%
            </button>
          ))}
        </div>
      </div>

      {/* Term */}
      <div className="mt-4">
        <label className="block text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-500">
          Term
        </label>
        <div className="mt-2 flex gap-2">
          {TERM_OPTIONS.map((t) => (
            <button key={t} type="button" onClick={() => setTerm(t)}
              className={`${pill} ${term === t ? activeP : inactiveP}`}>
              {t}mo
            </button>
          ))}
        </div>
      </div>

      {/* APR */}
      <div className="mt-4">
        <label className="block text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-500">
          Representative APR — {apr}%
        </label>
        <input
          type="range" min={3} max={29.9} step={0.1}
          value={apr}
          onChange={(e) => setApr(Number(e.target.value))}
          className="mt-2 w-full accent-brand-500"
        />
        <div className="flex justify-between text-[var(--text-2xs)] text-ink-400">
          <span>3%</span><span>29.9%</span>
        </div>
      </div>

      {/* Result */}
      <div className="mt-5 rounded-[var(--radius-lg)] bg-ink-900 p-4 text-white">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[clamp(1.8rem,4vw,2.4rem)] font-extrabold">{fmt(monthly)}</span>
          <span className="text-[var(--text-sm)] text-white/60">/ month</span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[var(--text-xs)] text-white/55">
          <span>Deposit</span><span className="text-right text-white/80">{fmt(deposit)}</span>
          <span>Borrowed</span><span className="text-right text-white/80">{fmt(borrowed)}</span>
          {type === "pcp" && <><span>Optional final pmt</span><span className="text-right text-white/80">{fmt(residual)}</span></>}
          <span>APR</span><span className="text-right text-white/80">{apr}%</span>
          <span>Total repayable</span><span className="text-right text-white/80">{fmt(totalRepayable)}</span>
          <span>Cost of credit</span><span className="text-right text-white/80">{fmt(totalCostOfCredit)}</span>
        </div>
      </div>

      <p className="mt-2 text-[var(--text-2xs)] leading-relaxed text-ink-400">
        Representative example for illustration only. Subject to status. Finance arranged through Dealski Finance Ltd.
        {type === "pcp" && " PCP residual estimated at 30% of purchase price — actual value varies."}
      </p>

      {applyUrl && (
        <Link
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex h-11 w-full items-center justify-center rounded-[var(--radius-md)] bg-brand-500 text-[var(--text-sm)] font-semibold text-white transition-colors hover:bg-brand-600"
        >
          Apply for finance →
        </Link>
      )}
    </div>
  );
}
