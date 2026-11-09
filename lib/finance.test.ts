import { test } from "node:test";
import assert from "node:assert/strict";
import { monthlyForListing, parsePay, DEFAULT_TERMS } from "./finance.ts";
import { financeQuote, financeQuoteVat } from "./hp-example.ts";

const dealer = { source: "vansales" as const, source_id: "10", seller_type: "dealer" as const };
const T = { ...DEFAULT_TERMS };

test("a VAT-qualifying dealer van's card equals its listing headline (60 months, VAT deposit, 24-month warranty)", () => {
  const card = monthlyForListing({ ...dealer, price: 10495, vat_status: "vat_qualifying" }, T);
  assert.equal(card, financeQuoteVat(10495, 0, 60, 699, 11.4).monthly);
  assert.equal(Math.round(card), 243);
});

test("a non-VAT dealer van uses the 10% slider default plus the warranty, like its listing", () => {
  const card = monthlyForListing({ ...dealer, price: 20000, vat_status: "no_vat" }, T);
  assert.equal(card, financeQuote(20000, 10, 60, 699, 11.4).monthly);
});

test("a chosen deposit % applies to a VAT-qualifying card too", () => {
  const card = monthlyForListing({ ...dealer, price: 20000, vat_status: "vat_qualifying" }, { ...T, depositPct: 10, depositSet: true });
  assert.equal(card, financeQuote(20000, 10, 60, 699, 11.4).monthly);
});

test("a private advert gets no warranty", () => {
  const priv = monthlyForListing({ source: "vansales", source_id: "3", seller_type: "private", vat_status: null, price: 9000 }, T);
  assert.ok(priv < monthlyForListing({ ...dealer, price: 9000, vat_status: "no_vat" }, T));
});

test("parsePay takes the server's APR / term / warranty unless the URL overrides them", () => {
  assert.deepEqual([parsePay({}, { apr: 12.9, termMonths: 48, warranty: 500 }).terms.apr, parsePay({}, { apr: 12.9, termMonths: 48, warranty: 500 }).terms.termMonths], [12.9, 48]);
  const t = parsePay({ apr: "8", term: "36", dep: "20" }, { apr: 12.9, termMonths: 48, warranty: 500 }).terms;
  assert.deepEqual([t.apr, t.termMonths, t.depositPct, t.depositSet], [8, 36, 20, true]);
});
