"use client";

import { FinanceDisclosure } from "@/components/finance/finance-disclosure";
import { useId, useState } from "react";
import { IconChevron } from "./icons";
import { DEPOSIT_MAX_PCT, DEPOSIT_MIN_PCT, DEPOSIT_STEP_PCT, FINANCE_APR_PCT, FINANCE_DEFAULT_TERM, FINANCE_TERMS, financeQuote, financeQuoteVat, type WarrantyAddon } from "@/lib/hp-example";

const gbp = (n: number) => `£${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const gbp0 = (n: number) => `£${Math.round(n).toLocaleString("en-GB")}`;

export interface FinanceConfig { apr: number; terms: number[]; default_term: number }

/** The HP "Finance calculator" under the dealer card: collapsible (open by default), representative APR and terms from the listing API (Swiss Vans' 11.4%, 12-60 months, default 60; admin Settings > Prices), UK CCA compound method (lib/hp-example.ts).
 *  VAT-qualifying vans (`price` ex VAT): the VAT is a locked upfront deposit plus an optional extra deposit; other vans keep the % slider. An illustration, not an offer. */
export function FinanceCalculator({ price, applyHref, warranties = [], finance, vatQualifying = false }: { price: number; applyHref: string; warranties?: WarrantyAddon[]; finance?: FinanceConfig | null; vatQualifying?: boolean }) {
  const apr = finance?.apr ?? FINANCE_APR_PCT;
  const terms: readonly number[] = finance?.terms?.length ? finance.terms : FINANCE_TERMS;
  const [extraRaw, setExtraRaw] = useState("");
  const [open, setOpen] = useState(true);
  const [pct, setPct] = useState(10);
  const [term, setTerm] = useState<number>(finance?.default_term ?? FINANCE_DEFAULT_TERM);
  // Starts on the longest warranty (Swiss Vans: 24 months AutoProtect); the block is hidden when the listing offers none (private sellers).
  const [wIdx, setWIdx] = useState(() => Math.max(0, warranties.reduce((best, w, i) => (w.months > (warranties[best]?.months ?? -1) ? i : best), 0)));
  const warranty = warranties[wIdx]?.price ?? 0;
  const id = useId();
  const extra = Number(extraRaw.replace(/[^\d.]/g, "")) || 0;
  const q = vatQualifying ? financeQuoteVat(price, extra, term, warranty, apr) : financeQuote(price, pct, term, warranty, apr);
  const vat = vatQualifying ? (q as ReturnType<typeof financeQuoteVat>).vat : 0;
  return (
    <section aria-labelledby={`${id}-t`} className="rounded-[var(--radius-xl)] border border-border bg-card p-5 shadow-[var(--shadow-sm)]">
      <h2 id={`${id}-t`} className="m-0">
        <button type="button" aria-expanded={open} aria-controls={`${id}-b`} onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 text-left font-display text-[length:var(--text-lg)] font-bold text-ink-900">
          <span className="flex min-w-0 flex-col">
            <span>Finance calculator</span>
            <span className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
              <span className="font-display text-[length:var(--text-2xl)] font-extrabold text-ink-900" data-testid="fin-headline">{gbp0(q.monthly)}/mo</span>
              <span className="text-[length:var(--text-xs)] font-normal text-ink-500">Representative {q.apr.toFixed(1)}% APR</span>
            </span>
          </span>
          <IconChevron width={18} height={18} aria-hidden className={`shrink-0 transition-transform ${open ? "rotate-90" : "-rotate-90"}`} />
        </button>
      </h2>
      {open && (
        <div id={`${id}-b`} className="mt-4 space-y-5">
          {vatQualifying ? (
            <div className="space-y-3" data-testid="fin-vat-deposit">
              <div className="flex items-baseline justify-between text-[length:var(--text-sm)] font-semibold text-ink-700"><span>VAT — always paid upfront</span><span className="text-ink-900" data-testid="fin-vat">{gbp(vat)}</span></div>
              <div>
                <label htmlFor={`${id}-extra`} className="text-[length:var(--text-sm)] font-semibold text-ink-700">Extra deposit (optional)</label>
                <div className="mt-1 flex items-center gap-2"><span className="text-ink-500">£</span>
                  <input id={`${id}-extra`} inputMode="numeric" placeholder="0" value={extraRaw} onChange={(e) => setExtraRaw(e.target.value.replace(/[^\d]/g, "").slice(0, 6))} className="h-10 w-full rounded-[var(--radius-md)] border border-border bg-white px-3 text-[length:var(--text-sm)] text-ink-900" />
                </div>
                <p className="mt-1 text-[length:var(--text-xs)] text-ink-400">Comes off the amount financed.</p>
              </div>
            </div>
          ) : (
          <div>
              <label htmlFor={`${id}-dep`} className="flex items-baseline justify-between text-[length:var(--text-sm)] font-semibold text-ink-700">
                <span>Deposit ({pct}%)</span><span className="text-ink-900" data-testid="fin-deposit">{gbp0(q.deposit)}</span>
              </label>
              <input id={`${id}-dep`} type="range" min={DEPOSIT_MIN_PCT} max={DEPOSIT_MAX_PCT} step={DEPOSIT_STEP_PCT} value={pct} onChange={(e) => setPct(Number(e.target.value))} className="mt-2 w-full accent-[var(--color-accent-500,#f47c1e)]" />
              <div className="flex justify-between text-[length:var(--text-xs)] text-ink-400"><span>{DEPOSIT_MIN_PCT}%</span><span>{DEPOSIT_MAX_PCT}%</span></div>
            </div>
          )}

          <fieldset>
            <legend className="text-[length:var(--text-sm)] font-semibold text-ink-700">Term</legend>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {terms.map((t) => (
                <button key={t} type="button" aria-pressed={term === t} onClick={() => setTerm(t)}
                  className={`h-10 rounded-[var(--radius-md)] border text-[length:var(--text-sm)] font-semibold transition-colors ${term === t ? "border-brand-600 bg-brand-600 text-white" : "border-border bg-white text-ink-800 hover:border-ink-400"}`}>
                  {t}<span className="sr-only"> months</span>
                </button>
              ))}
            </div>
            <p className="mt-1 text-[length:var(--text-xs)] text-ink-400">months</p>
          </fieldset>

          {warranties.length > 0 && (
            <fieldset data-testid="fin-warranty">
              <legend className="text-[length:var(--text-sm)] font-semibold text-ink-700">Warranty add-on</legend>
              <div className="mt-2 space-y-1.5">
                {warranties.map((w, i) => (
                  <label key={`${w.name}-${w.months}`} className="flex cursor-pointer items-center gap-2 text-[length:var(--text-sm)] text-ink-800">
                    <input type="radio" name={`${id}-w`} checked={wIdx === i} onChange={() => setWIdx(i)} className="accent-[var(--color-brand-600,#13427f)]" />
                    {w.months} months {w.name}{w.price > 0 ? <span className="text-ink-500"> (+£{w.price})</span> : <span className="text-ink-500"> (included)</span>}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <div className="rounded-[var(--radius-lg)] bg-surface-1 p-4" aria-live="polite">
            <dl className="space-y-1 text-[length:var(--text-sm)]">
              {([
                [vatQualifying ? "Deposit (VAT" + (q.deposit > vat ? " + extra)" : ")") : "Deposit", gbp(q.deposit)],
                ...(warranties.length > 0 ? [["Warranty", warranty > 0 ? gbp(warranty) : "Included"] as const] : []),
                ["Amount financed", gbp(q.credit)],
                ["APR (representative)", `${q.apr.toFixed(1)}%`],
                ["Total amount payable", gbp(q.totalPayable)],
                ["Total charge for credit", gbp(q.charge)],
              ] as const).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3"><dt className="text-ink-500">{k}</dt><dd className="font-medium text-ink-900">{v}</dd></div>
              ))}
            </dl>
            <p className="mt-3 font-display text-[length:var(--text-2xl)] font-extrabold leading-tight text-ink-900" data-testid="fin-monthly">{term} × {gbp(q.monthly)}</p>
          </div>

          <div className="space-y-1.5">
            <p className="text-[length:var(--text-xs)] leading-relaxed text-ink-500">Representative example. Finance subject to status. 18+, UK residents.</p>
            <FinanceDisclosure />
          </div>
          <a href={applyHref} className="flex h-11 w-full items-center justify-center rounded-[var(--radius-md)] bg-brand-600 px-3 text-[length:var(--text-sm)] font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
            Apply for finance
          </a>
        </div>
      )}
    </section>
  );
}
