import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { FINANCE_DISCLOSURE } from "./finance-disclosure.ts";

test("the disclosure is Ian's approved wording, word for word", () => {
  assert.equal(
    FINANCE_DISCLOSURE,
    "Vansales.com is a trading name of Swiss Vans Ltd, authorised and regulated by the Financial Conduct Authority (FRN 668283). Swiss Vans Ltd is a credit broker, not a lender, and can introduce you to a limited number of lenders. We may receive a commission from the lender for introducing you; the amount varies by lender and product and does not affect the rate you pay.",
  );
});

function walk(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|md)$/.test(f) && !/\.test\./.test(f)) out.push(p);
  }
  return out;
}

test("no other file spells out the FRN, 'credit broker' or 'authorised and regulated' (single source)", () => {
  const offenders = ["app", "components", "lib", "content"].flatMap((d) => walk(d)).filter((f) => {
    if (f === join("lib", "finance-disclosure.ts")) return false;
    return /668283|credit broker|authorised and regulated/i.test(readFileSync(f, "utf8"));
  });
  assert.deepEqual(offenders, []);
});
