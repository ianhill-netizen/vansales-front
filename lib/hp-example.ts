/** The listing page's Finance calculator (separate from lib/finance.ts, which drives the search-card estimates): representative APR (Swiss Vans' 11.4%; the live value comes from the listing API, admin Settings > Prices), UK CCA compound method (the monthly rate is the 12th root of 1 + APR). */
export const FINANCE_APR_PCT = 11.4;
export const FINANCE_TERMS = [12, 24, 36, 48, 60] as const;
export const FINANCE_DEFAULT_TERM = 60;
export const VAT_RATE = 0.2;
export const DEPOSIT_MIN_PCT = 10;
export const DEPOSIT_MAX_PCT = 50;
export const DEPOSIT_STEP_PCT = 5;
/** One warranty add-on the calculator offers: from the listing API (admin-set; Swiss Vans' AutoProtect 24m / 12m and the included 3-month RTB by default). price = whole pounds, 0 = included. */
export interface WarrantyAddon { name: string; months: number; price: number }

export interface FinanceQuote {
  /** The deposit in pounds. */
  deposit: number;
  /** Amount of credit: price + warranty - deposit. */
  credit: number;
  /** Monthly payment, to the penny. */
  monthly: number;
  /** Total of the monthly payments plus the deposit. */
  totalPayable: number;
  /** Total charge for credit: what the payments cost beyond the credit itself. */
  charge: number;
  apr: number;
}

const pence = (n: number) => Math.round(n * 100) / 100;

const monthlyFor = (credit: number, aprPct: number, months: number) => {
  const r = Math.pow(1 + aprPct / 100, 1 / 12) - 1;
  return pence((credit * r) / (1 - Math.pow(1 + r, -months)));
};

/** r = (1 + APR)^(1/12) - 1;  M = B * r / (1 - (1 + r)^-n);  B = price + warranty - deposit. Deposit is a percentage (10-50, step 5) of the vehicle price (vans with no VAT to pay upfront). */
export function financeQuote(price: number, depositPct: number, months: number, warranty: number, aprPct: number = FINANCE_APR_PCT): FinanceQuote {
  const deposit = pence((price * depositPct) / 100);
  const credit = pence(price + warranty - deposit);
  const monthly = monthlyFor(credit, aprPct, months);
  const paid = pence(monthly * months);
  return { deposit, credit, monthly, totalPayable: pence(paid + deposit), charge: pence(paid - credit), apr: aprPct };
}

/** VAT-qualifying vans (Swiss Vans' basis): `price` is ex VAT; the VAT (20%) is ALWAYS paid upfront and is the deposit's floor, with an optional extra deposit on top that comes off the amount financed. Amount financed = price - extra deposit + warranty. */
export function financeQuoteVat(price: number, extraDeposit: number, months: number, warranty: number, aprPct: number = FINANCE_APR_PCT): FinanceQuote & { vat: number; extra: number } {
  const vat = pence(price * VAT_RATE);
  const extra = pence(Math.min(Math.max(0, Number.isFinite(extraDeposit) ? extraDeposit : 0), price));
  const credit = pence(price - extra + Math.max(0, warranty));
  const monthly = monthlyFor(credit, aprPct, months);
  const paid = pence(monthly * months);
  const deposit = pence(vat + extra);
  return { deposit, credit, monthly, totalPayable: pence(paid + deposit), charge: pence(paid - credit), apr: aprPct, vat, extra };
}
