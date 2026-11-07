import { test } from "node:test";
import assert from "node:assert/strict";
import { chooseExtras, shouldNoindexEmpty, shouldSkipRetry, RETRY_AFTER_FAILURE_MS } from "./extras-guard.ts";

test("a good load wins and is not marked degraded", () => {
  assert.deepEqual(chooseExtras({ listings: [1, 2], degraded: false }, [9]), { listings: [1, 2], degraded: false });
});

test("a failed load serves the last good catalogue, flagged degraded (stale-on-error)", () => {
  assert.deepEqual(chooseExtras({ listings: [], degraded: true }, [7, 8, 9]), { listings: [7, 8, 9], degraded: true });
});

test("a failed load with nothing stale serves what it did get, flagged degraded", () => {
  assert.deepEqual(chooseExtras({ listings: [3], degraded: true }, null), { listings: [3], degraded: true });
  assert.deepEqual(chooseExtras({ listings: [], degraded: true }, null), { listings: [], degraded: true });
});

test("an empty catalogue is only noindex when the zero is real", () => {
  assert.equal(shouldNoindexEmpty(0, false), true);
  assert.equal(shouldNoindexEmpty(0, true), false);
  assert.equal(shouldNoindexEmpty(3, false), false);
  assert.equal(shouldNoindexEmpty(3, true), false);
});

test("after a failure the API is left alone for a short while, then retried", () => {
  assert.equal(shouldSkipRetry(0, 1_000_000), false);
  assert.equal(shouldSkipRetry(1_000, 1_000 + RETRY_AFTER_FAILURE_MS - 1), true);
  assert.equal(shouldSkipRetry(1_000, 1_000 + RETRY_AFTER_FAILURE_MS), false);
});
