import { test } from "node:test";
import assert from "node:assert/strict";
import { SELL_PAGES, SELL_STEPS, findSellPage, sellPagePath } from "./sell-pages.ts";

test("five pages at the five URLs, each with unique, in-limit copy", () => {
  assert.deepEqual(SELL_PAGES.map(sellPagePath), ["/sell-my-van", "/sell-my-van-fast", "/sell-my-van-online", "/van-valuation", "/sell-used-van"]);
  assert.equal(new Set(SELL_PAGES.map((p) => p.description)).size, 5);
  assert.equal(new Set(SELL_PAGES.map((p) => p.title)).size, 5);
  for (const p of SELL_PAGES) {
    assert.ok(p.description.length <= 155, p.slug);
    assert.ok(p.title.length <= 60 && p.title.endsWith("Vansales.com"), p.slug);
  }
  assert.equal(findSellPage("sell-my-van")?.h1, "Sell My Van");
  assert.equal(findSellPage("nope"), undefined);
  assert.equal(SELL_STEPS.length, 6);
});
