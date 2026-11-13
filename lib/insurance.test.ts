import test from "node:test";
import assert from "node:assert/strict";
import { INSURANCE_BACKEND_SLUGS, INSURANCE_BANNED, INSURANCE_HUB, INSURANCE_TOPICS } from "./insurance.ts";

test("insurance topics: unique slugs and backend slugs, titles within a search result, no banned wording", () => {
  assert.equal(INSURANCE_TOPICS.length, 13);
  assert.equal(new Set(INSURANCE_BACKEND_SLUGS).size, 14);
  for (const t of [INSURANCE_HUB, ...INSURANCE_TOPICS]) {
    assert.ok(t.title.length <= 75, t.title);
    assert.ok(t.description.length <= 170, t.description);
    assert.doesNotMatch(`${t.title} ${t.description} ${t.h1}`, INSURANCE_BANNED);
  }
  assert.match("We recommend Admiral", INSURANCE_BANNED);
});
