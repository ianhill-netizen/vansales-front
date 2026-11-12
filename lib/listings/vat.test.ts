import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { priceFieldsFor, vatLabel, vatState, vatOnTop, valueAddedTaxIncluded, offerPriceLd } from "./vat.ts";
import { monthlyForListing } from "../finance.ts";

const STATUSES = ["vat_qualifying", "ex_vat", "inc_vat", "no_vat", null, undefined, "", "inc", "ex", "weird"] as const;
const label = (s: string | null | undefined) => { const f = priceFieldsFor(s); return vatLabel(f.price_type, f.vat_qualifying); };

test("mapping table: every state renders exactly its own qualifier", () => {
  assert.equal(label("ex_vat"), "+ VAT");
  assert.equal(label("vat_qualifying"), "+ VAT");
  assert.equal(label("inc_vat"), "inc. VAT");
  assert.equal(label("no_vat"), "No VAT");
  assert.equal(label(null), "");
  assert.equal(label(undefined), "");
  assert.equal(label("weird"), "");
});

test("price_type / vat_qualifying pairs", () => {
  assert.deepEqual(priceFieldsFor("ex_vat"), { price_type: "ex_vat", vat_qualifying: true });
  assert.deepEqual(priceFieldsFor("vat_qualifying"), { price_type: "ex_vat", vat_qualifying: true });
  assert.deepEqual(priceFieldsFor("inc_vat"), { price_type: "inc_vat", vat_qualifying: false });
  assert.deepEqual(priceFieldsFor("no_vat"), { price_type: "no_vat", vat_qualifying: false });
  assert.deepEqual(priceFieldsFor(null), { price_type: "unknown", vat_qualifying: false });
});

test("GUARD: a rendered price never says 'inc. VAT' unless vat_status === 'inc_vat' (property over all states)", () => {
  for (const s of STATUSES) {
    const text = label(s);
    assert.equal(/inc\.?\s*vat/i.test(text), s === "inc_vat", `status ${JSON.stringify(s)} rendered ${JSON.stringify(text)}`);
  }
  // also for every combination of the raw Listing fields except the legacy demo pair inc_vat
  for (const pt of ["ex_vat", "no_vat", "unknown"] as const) for (const q of [true, false]) assert.doesNotMatch(vatLabel(pt, q), /inc\.?\s*vat/i);
});

test("GUARD: no app code outside vat.ts / the explicit badge table / demo sources can print 'inc. VAT'", () => {
  const allowed = new Set(["lib/listings/vat.ts", "lib/listings/vanDetails.ts", "lib/listings/types.ts", "lib/listings/sources/vansales.ts", "lib/listings/sources/mock.ts", "lib/listings/sources/acme-demo.ts"]);
  const root = new URL("../../", import.meta.url).pathname;
  const hits: string[] = [];
  const walk = (dir: string) => {
    for (const n of readdirSync(join(root, dir))) {
      const rel = `${dir}/${n}`;
      if (n === "node_modules" || n === ".next") continue;
      if (statSync(join(root, rel)).isDirectory()) { walk(rel); continue; }
      if (!/\.(ts|tsx)$/.test(n) || /\.test\./.test(n) || allowed.has(rel)) continue;
      if (/inc\.?\s*vat/i.test(readFileSync(join(root, rel), "utf8"))) hits.push(rel);
    }
  };
  for (const d of ["app", "components", "lib"]) walk(d);
  assert.deepEqual(hits, []);
});

test("vatState folds the legacy vat_qualifying into ex_vat and anything else into unknown", () => {
  assert.equal(vatState("vat_qualifying"), "ex_vat");
  assert.equal(vatState("inc"), "unknown");
  assert.equal(vatState(null), "unknown");
});

test("JSON-LD: valueAddedTaxIncluded is true only for inc_vat, false for ex_vat, omitted for no_vat and unknown; the price is never converted", () => {
  assert.equal(valueAddedTaxIncluded("inc_vat"), true);
  assert.equal(valueAddedTaxIncluded("ex_vat"), false);
  assert.equal(valueAddedTaxIncluded("vat_qualifying"), false);
  assert.equal(valueAddedTaxIncluded("no_vat"), undefined);
  assert.equal(valueAddedTaxIncluded(null), undefined);
  const ex = offerPriceLd(74999, "ex_vat") as { price: number; priceSpecification: { valueAddedTaxIncluded: boolean; price: number } };
  assert.equal(ex.price, 74999);
  assert.equal(ex.priceSpecification.price, 74999);
  assert.equal(ex.priceSpecification.valueAddedTaxIncluded, false);
  assert.equal((offerPriceLd(1000, "inc_vat") as { priceSpecification: { valueAddedTaxIncluded: boolean } }).priceSpecification.valueAddedTaxIncluded, true);
  assert.ok(!("priceSpecification" in offerPriceLd(1000, "no_vat")));
  assert.ok(!("priceSpecification" in offerPriceLd(1000, null)));
  assert.equal((offerPriceLd(1000, null) as { price: number }).price, 1000);
  assert.deepEqual(offerPriceLd(null, "ex_vat"), { priceCurrency: "GBP" });
});

test("finance: the VAT uplift applies only when the price is ex VAT, never on unknown / inc_vat / no_vat", () => {
  assert.equal(vatOnTop("ex_vat"), true);
  assert.equal(vatOnTop("vat_qualifying"), true);
  for (const s of ["inc_vat", "no_vat", null, undefined]) assert.equal(vatOnTop(s), false);
  const T = { depositPct: 10, depositSet: false, termMonths: 60, warranty: 0, apr: 11.4 };
  const dealer = { source: "vansales" as const, source_id: "3", seller_type: "dealer" as const, price: 20000 };
  const unknown = monthlyForListing({ ...dealer, vat_status: null }, T);
  assert.equal(unknown, monthlyForListing({ ...dealer, vat_status: "inc_vat" }, T));
  assert.equal(unknown, monthlyForListing({ ...dealer, vat_status: "no_vat" }, T));
  assert.ok(monthlyForListing({ ...dealer, vat_status: "ex_vat" }, T) > unknown, "ex VAT: the VAT is financed-as-deposit basis, so it differs from the plain estimate");
});
