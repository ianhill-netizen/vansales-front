/** The listing page's Finance calculator (separate from lib/finance.ts, which drives the search-card estimates): APR 9.9% representative, UK CCA compound method (the monthly rate is the 12th root of 1 + APR). */
export const FINANCE_APR = 0.099;
export const FINANCE_TERMS = [24, 36, 48, 60] as const;
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

/** r = (1 + APR)^(1/12) - 1;  M = B * r / (1 - (1 + r)^-n);  B = price + warranty - deposit. Deposit is a percentage (10-50, step 5) of the vehicle price. */
export function financeQuote(price: number, depositPct: number, months: number, warranty: number): FinanceQuote {
  const deposit = pence((price * depositPct) / 100);
  const credit = pence(price + warranty - deposit);
  const r = Math.pow(1 + FINANCE_APR, 1 / 12) - 1;
  const monthly = pence((credit * r) / (1 - Math.pow(1 + r, -months)));
  const paid = pence(monthly * months);
  return { deposit, credit, monthly, totalPayable: pence(paid + deposit), charge: pence(paid - credit), apr: FINANCE_APR * 100 };
}
