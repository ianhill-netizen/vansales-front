import test from "node:test";
import assert from "node:assert/strict";
import { retryDelayMs } from "./retry.ts";

test("Retry-After (seconds) is honoured but capped", () => {
  assert.equal(retryDelayMs(1, "1"), 1000);
  assert.equal(retryDelayMs(1, "0"), 0);
  assert.equal(retryDelayMs(1, "45"), 1500);
});

test("without a usable Retry-After the back-off grows and stays bounded", () => {
  assert.equal(retryDelayMs(1, null, 0), 300);
  assert.equal(retryDelayMs(2, null, 0), 600);
  assert.equal(retryDelayMs(2, "soon", 0), 600);
  assert.equal(retryDelayMs(9, null, 1), 1500);
});
