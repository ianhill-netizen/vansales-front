import { test } from "node:test";
import assert from "node:assert/strict";
import { dealerFinanceLine, isSwissVans } from "./finance-scope.ts";

const sv = { seller: { name: "Swiss Vans", type: "dealer" as const, logo: null, rating: null }, seller_type: "dealer" as const, dealer_contact: { slug: "swiss-vans", name: "Swiss Vans", finance_url: "https://x/finance" } };
const other = { seller: { name: "Rhys Huish Commercials", type: "dealer" as const, logo: null, rating: null }, seller_type: "dealer" as const, dealer_contact: { slug: "rhys-huish", name: "Rhys Huish Commercials", finance_url: "https://rh/finance", fca_frn: "123456" } };
const priv = { seller: { name: "Private seller", type: "private" as const, logo: null, rating: null }, seller_type: "private" as const };

test("only Swiss Vans dealer stock is in finance scope", () => {
  assert.equal(isSwissVans(sv), true);
  assert.equal(isSwissVans(other), false);
  assert.equal(isSwissVans(priv), false);
  assert.equal(isSwissVans({ seller: { ...sv.seller, name: "Swiss Vans Ltd" }, seller_type: "dealer" }), true, "name fallback when there is no dealer slug");
  assert.equal(isSwissVans({ seller: { ...priv.seller, name: "Swiss Vans" }, seller_type: "private" }), false, "a private seller is never in scope");
});

test("another dealer gets one plain line, with its FRN only when we hold it; no line without a finance link", () => {
  assert.equal(dealerFinanceLine(other), "Finance available from Rhys Huish Commercials (FCA FRN 123456)");
  assert.equal(dealerFinanceLine({ ...other, dealer_contact: { ...other.dealer_contact, fca_frn: null } }), "Finance available from Rhys Huish Commercials");
  assert.equal(dealerFinanceLine({ ...other, dealer_contact: { ...other.dealer_contact, finance_url: null } }), null);
  assert.equal(dealerFinanceLine(sv), null);
  assert.equal(dealerFinanceLine(priv), null);
});
