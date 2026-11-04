// HP monthly payment estimate — defaults: 48-month term, 9.9% APR, variable deposit.
// Figures are indicative only; exact quotes depend on lender criteria.

const TERM_MONTHS = 48;
const ANNUAL_APR = 9.9;

export interface FinanceTerms {
  /** Deposit as a percentage of the price (0–50). */
  depositPct: number;
  termMonths: number;
  apr: number;
}

export const DEFAULT_TERMS: FinanceTerms = { depositPct: 10, termMonths: TERM_MONTHS, apr: ANNUAL_APR };
export const TERM_OPTIONS = [24, 36, 48, 60, 72] as const;

function rate(apr: number) {
  return apr / 100 / 12;
}

/** Estimate HP monthly payment given vehicle price and deposit amount (GBP). */
export function estimateMonthly(
  pricePounds: number,
  depositPounds = 0,
  termMonths = TERM_MONTHS,
  apr = ANNUAL_APR,
): number {
  const principal = Math.max(0, pricePounds - depositPounds);
  const r = rate(apr);
  if (r === 0) return principal / termMonths;
  return (principal * r) / (1 - Math.pow(1 + r, -termMonths));
}

/** Monthly payment for a price under percentage-deposit terms (what the results cards show). */
export function monthlyForTerms(pricePounds: number, t: FinanceTerms): number {
  return estimateMonthly(pricePounds, pricePounds * (t.depositPct / 100), t.termMonths, t.apr);
}

/** Inverse: given max monthly payment and deposit amount, return the max affordable price. */
export function priceFromMonthly(monthlyPounds: number, depositPounds = 0): number {
  const r = rate(ANNUAL_APR);
  const principal =
    r === 0
      ? monthlyPounds * TERM_MONTHS
      : (monthlyPounds * (1 - Math.pow(1 + r, -TERM_MONTHS))) / r;
  return Math.round(principal + depositPounds);
}

export const FINANCE_ASSUMPTIONS = {
  termMonths: TERM_MONTHS,
  apr: ANNUAL_APR,
};

export type PayMode = "cash" | "finance" | "both";

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Read ?pay, ?dep (%), ?term (months), ?apr from search params. Cash is the default. */
export function parsePay(sp: Record<string, string | string[] | undefined>): { mode: PayMode; terms: FinanceTerms } {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const raw = one(sp.pay);
  const mode: PayMode = raw === "finance" || raw === "both" ? raw : "cash";
  const num = (v: string | string[] | undefined) => {
    const n = Number(one(v));
    return Number.isFinite(n) && one(v) !== undefined && one(v) !== "" ? n : undefined;
  };
  return {
    mode,
    terms: {
      depositPct: clamp(num(sp.dep) ?? DEFAULT_TERMS.depositPct, 0, 50),
      termMonths: clamp(Math.round(num(sp.term) ?? DEFAULT_TERMS.termMonths), 12, 84),
      apr: clamp(num(sp.apr) ?? DEFAULT_TERMS.apr, 0, 29.9),
    },
  };
}
