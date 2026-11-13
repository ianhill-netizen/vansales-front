import { test } from "node:test";
import assert from "node:assert/strict";
import { HOME_FAQ, homeFaqSchema } from "./home-faq.ts";

test("the FAQ schema carries exactly the visible questions and answers", () => {
  const s = homeFaqSchema();
  assert.equal(s["@type"], "FAQPage");
  assert.equal(HOME_FAQ.length, 5);
  assert.deepEqual(s.mainEntity.map((e) => [e.name, e.acceptedAnswer.text]), HOME_FAQ.map((f) => [f.q, f.a]));
});
