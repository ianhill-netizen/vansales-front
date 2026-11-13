import { test } from "node:test";
import assert from "node:assert/strict";
import { VAN_FINANCE_FAQ, vanFinanceFaqSchema } from "./van-finance-faq.ts";

test("six questions, schema matches the visible text, no figures or promises", () => {
  assert.equal(VAN_FINANCE_FAQ.length, 6);
  const s = vanFinanceFaqSchema();
  assert.deepEqual(s.mainEntity.map((e) => [e.name, e.acceptedAnswer.text]), VAN_FINANCE_FAQ.map((f) => [f.q, f.a]));
  for (const f of VAN_FINANCE_FAQ) {
    assert.doesNotMatch(f.a, /%|£|guaranteed|instant approval|best rate|None|undefined/i, f.q);
  }
});
