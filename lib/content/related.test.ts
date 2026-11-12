import test from "node:test";
import assert from "node:assert/strict";
import { latest, mentioning, neighbours, sortNewestFirst } from "./related.ts";

const items = sortNewestFirst([
  { slug: "a", title: "Ford Transit Custom dimensions", date: "2026-11-10" },
  { slug: "b", title: "Mercedes-Benz Sprinter running costs", date: "2026-11-09" },
  { slug: "c", title: "Undated guide about Ford vans", date: "" },
  { slug: "d", title: "Best Fords for tradesmen", date: "2026-11-01" },
  { slug: "e", title: "Renault Master vs Ford Transit", date: "2026-10-01" },
]);

test("newest first, undated last", () => assert.deepEqual(items.map((i) => i.slug), ["a", "b", "d", "e", "c"]));

test("every item has at least one neighbour, so none is linked from nothing but its index", () => {
  for (const i of items) {
    const n = neighbours(items, i.slug);
    assert.ok(n.newer || n.older, i.slug);
  }
  assert.deepEqual(neighbours(items, "b"), { newer: items[0], older: items[2] });
  assert.deepEqual(neighbours(items, "a").newer, null);
  assert.deepEqual(neighbours(items, "nope"), { newer: null, older: null });
});

test("mentioning matches whole words only, ignores the item itself and respects the limit", () => {
  assert.deepEqual(mentioning(items, ["Ford"], 10).map((i) => i.slug), ["a", "e", "c"]); // "Fords" is not "Ford"
  assert.deepEqual(mentioning(items, ["Ford"], 1, "a").map((i) => i.slug), ["e"]);
  assert.deepEqual(mentioning(items, ["Mercedes"], 5).map((i) => i.slug), ["b"]); // Mercedes-Benz: whole word before the hyphen
  assert.deepEqual(mentioning(items, ["Mercedes-Benz"], 5).map((i) => i.slug), ["b"]);
  assert.deepEqual(mentioning(items, [], 5), []);
});

test("latest skips the excluded slug", () => assert.deepEqual(latest(items, 2, "a").map((i) => i.slug), ["b", "d"]));
