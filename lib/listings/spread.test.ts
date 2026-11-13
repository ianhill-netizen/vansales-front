import { test } from "node:test";
import assert from "node:assert/strict";
import { spreadBySeller } from "./spread.ts";

const l = (id: number, name: string) => ({ id, seller: { name, type: "dealer" } });

test("takes at most one listing per seller when there are enough sellers", () => {
  const pool = [l(1, "A"), l(2, "A"), l(3, "B"), l(4, "A"), l(5, "C"), l(6, "D"), l(7, "B")];
  assert.deepEqual(spreadBySeller(pool, 4).map((x) => x.id), [1, 3, 5, 6]);
});

test("falls back to the first n when fewer than n sellers have stock", () => {
  const pool = [l(1, "A"), l(2, "A"), l(3, "B"), l(4, "A"), l(5, "B")];
  assert.deepEqual(spreadBySeller(pool, 4).map((x) => x.id), [1, 2, 3, 4]);
});

test("seller names compare case-insensitively", () => {
  const pool = [l(1, "Van Co"), l(2, "van co "), l(3, "B"), l(4, "C"), l(5, "D")];
  assert.deepEqual(spreadBySeller(pool, 4).map((x) => x.id), [1, 3, 4, 5]);
});

test("a short pool is returned whole", () => {
  assert.deepEqual(spreadBySeller([l(1, "A")], 4).map((x) => x.id), [1]);
});
