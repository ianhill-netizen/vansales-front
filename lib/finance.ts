// HP monthly payment estimate: 10% deposit, 48-month term, 9.9% APR.
// These figures are indicative only — exact quotes depend on lender criteria.

const DEPOSIT_PCT = 0.10;
const TERM_MONTHS = 48;
const ANNUAL_APR = 9.9;

function monthlyRate() {
  return ANNUAL_APR / 100 / 12;
}

/** Estimate HP monthly payment for a vehicle at the given price (GBP). */
export function estimateMonthly(pricePounds: number): number {
  const principal = pricePounds * (1 - DEPOSIT_PCT);
  const r = monthlyRate();
  if (r === 0) return principal / TERM_MONTHS;
  return (principal * r) / (1 - Math.pow(1 + r, -TERM_MONTHS));
}

/** Inverse: given a max monthly payment, return the corresponding max vehicle price. */
export function priceFromMonthly(monthlyPounds: number): number {
  const r = monthlyRate();
  const principal =
    r === 0
      ? monthlyPounds * TERM_MONTHS
      : (monthlyPounds * (1 - Math.pow(1 + r, -TERM_MONTHS))) / r;
  return Math.round(principal / (1 - DEPOSIT_PCT));
}

export const FINANCE_ASSUMPTIONS = {
  depositPct: DEPOSIT_PCT,
  termMonths: TERM_MONTHS,
  apr: ANNUAL_APR,
};
