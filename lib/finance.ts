// HP monthly payment estimate: the same basis as the listing page's calculator (lib/hp-example.ts): the admin's representative APR (lib/finance-config.ts, fallback 11.4%), a 60-month default term and, on a dealer advert,
// the default 24-month warranty financed with the van and (VAT-qualifying vans) the VAT as the deposit. Figures are indicative only; exact quotes depend on lender criteria.
import { financeQuote, financeQuoteVat } from "./hp-example.ts";
import type { Listing } from "./listings/types";

const TERM_MONTHS = 60;
const ANNUAL_APR = 11.4;

export interface FinanceTerms {
  /** Deposit as a percentage of the price (0–50). */
  depositPct: number;
  termMonths: number;
  apr: number;
  /** The default warranty add-on (whole pounds) financed on a dealer advert, as the listing calculator does. */
  warranty: number;
  /** True when the visitor chose a deposit (?dep): then the % applies to every card; otherwise a VAT-qualifying dealer van uses its VAT as the deposit, like its listing page. */
  depositSet: boolean;
}

export const DEFAULT_TERMS: FinanceTerms = { depositPct: 10, termMonths: TERM_MONTHS, apr: ANNUAL_APR, warranty: 699, depositSet: false };
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

/** The monthly a card shows for a listing. A dealer advert is priced exactly as its listing page's calculator opens (term, APR, default warranty, VAT as deposit when VAT-qualifying), so card and listing agree; anything else is the plain estimate. */
export function monthlyForListing(l: Pick<Listing, "price" | "source" | "source_id" | "seller_type" | "vat_status">, t: FinanceTerms): number {
  const price = l.price ?? 0;
  const dealerAdvert = l.source === "vansales" && /^\d+$/.test(l.source_id) && l.seller_type === "dealer" && price > 0;
  if (!dealerAdvert) return monthlyForTerms(price, t);
  if (l.vat_status === "vat_qualifying" && !t.depositSet) return financeQuoteVat(price, 0, t.termMonths, t.warranty, t.apr).monthly;
  return financeQuote(price, t.depositPct, t.termMonths, t.warranty, t.apr).monthly;
}

/** Inverse: given max monthly payment and deposit amount, return the max affordable price. */
export function priceFromMonthly(monthlyPounds: number, depositPounds = 0, aprPct = ANNUAL_APR, termMonths = TERM_MONTHS): number {
  const r = rate(aprPct);
  const principal =
    r === 0
      ? monthlyPounds * termMonths
      : (monthlyPounds * (1 - Math.pow(1 + r, -termMonths))) / r;
  return Math.round(principal + depositPounds);
}

export const FINANCE_ASSUMPTIONS = {
  termMonths: TERM_MONTHS,
  apr: ANNUAL_APR,
};

export type PayMode = "cash" | "finance" | "both";

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Read ?pay, ?dep (%), ?term (months), ?apr from search params. Cash is the default. */
export function parsePay(sp: Record<string, string | string[] | undefined>, cfg: { apr: number; termMonths: number; warranty: number } = { apr: ANNUAL_APR, termMonths: TERM_MONTHS, warranty: DEFAULT_TERMS.warranty }): { mode: PayMode; terms: FinanceTerms } {
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
      termMonths: clamp(Math.round(num(sp.term) ?? cfg.termMonths), 12, 84),
      apr: clamp(num(sp.apr) ?? cfg.apr, 0, 29.9),
      warranty: cfg.warranty,
      depositSet: num(sp.dep) !== undefined,
    },
  };
}
