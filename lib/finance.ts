// HP monthly payment estimate — 48-month term, 9.9% APR, variable deposit.
// Figures are indicative only; exact quotes depend on lender criteria.

const TERM_MONTHS = 48;
const ANNUAL_APR = 9.9;

function monthlyRate() {
  return ANNUAL_APR / 100 / 12;
}

/** Estimate HP monthly payment given vehicle price and deposit amount (GBP). */
export function estimateMonthly(pricePounds: number, depositPounds = 0): number {
  const principal = Math.max(0, pricePounds - depositPounds);
  const r = monthlyRate();
  if (r === 0) return principal / TERM_MONTHS;
  return (principal * r) / (1 - Math.pow(1 + r, -TERM_MONTHS));
}

/** Inverse: given max monthly payment and deposit amount, return the max affordable price. */
export function priceFromMonthly(monthlyPounds: number, depositPounds = 0): number {
  const r = monthlyRate();
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
