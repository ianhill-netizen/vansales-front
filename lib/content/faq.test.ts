import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFaq } from "./faq.ts";

test("parseFaq reads the questions under the FAQ heading only", () => {
  const html = "<h2>Intro</h2><h3>Not a question</h3><p>x</p><h2>Frequently asked questions</h2><h3>Is it legal?</h3><p>Check with your insurer.</p><h3>Does it add weight?</h3><p>Yes &amp; it matters.</p>";
  assert.deepEqual(parseFaq(html), [{ q: "Is it legal?", a: "Check with your insurer." }, { q: "Does it add weight?", a: "Yes & it matters." }]);
  assert.deepEqual(parseFaq("<h2>No faq</h2><p>x</p>"), []);
});
