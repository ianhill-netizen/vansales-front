import { test } from "node:test";
import assert from "node:assert/strict";
import { financeQuote, financeQuoteVat } from "./hp-example.ts";

test("£20,000, 20% deposit, 48 months, no warranty: borrows £16,000 at 9.9% APR", () => {
  const q = financeQuote(20000, 20, 48, 0, 9.9);
  assert.equal(q.deposit, 4000);
  assert.equal(q.credit, 16000);
  assert.ok(Math.abs(q.monthly - 401.8) < 0.5, `monthly ${q.monthly}`);   // 9.9% APR over 4 years
  assert.equal(q.charge, Math.round((q.monthly * 48 - 16000) * 100) / 100);
  assert.equal(q.totalPayable, Math.round((q.monthly * 48 + 4000) * 100) / 100);
  assert.equal(q.apr, 9.9);
});

test("the warranty is financed with the van", () => {
  const a = financeQuote(10000, 10, 36, 0);
  const b = financeQuote(10000, 10, 36, 349);
  assert.equal(b.credit, a.credit + 349);
  assert.ok(b.monthly > a.monthly);
});

test("a longer term costs less a month and more in total", () => {
  const short = financeQuote(15000, 10, 24, 0);
  const long = financeQuote(15000, 10, 60, 0);
  assert.ok(long.monthly < short.monthly);
  assert.ok(long.charge > short.charge);
});

test("VAT-qualifying: VAT is the locked deposit, the extra deposit and the warranty change the amount financed", () => {
  const q = financeQuoteVat(20000, 0, 60, 699);
  assert.equal(q.vat, 4000);
  assert.equal(q.deposit, 4000);
  assert.equal(q.credit, 20699);
  assert.equal(q.apr, 11.4);
  const e = financeQuoteVat(20000, 3000, 60, 699);
  assert.equal(e.deposit, 7000);
  assert.equal(e.credit, 17699);
  assert.ok(e.monthly < q.monthly);
  // Swiss Vans' flat basis (6% flat over 60 months is a representative 11.4%): the two agree to within a few pence a month.
  const flat = (20699 + 20699 * 0.06 * 5) / 60;
  assert.ok(Math.abs(q.monthly - flat) < 0.5, `annuity ${q.monthly} vs flat ${flat}`);
});
