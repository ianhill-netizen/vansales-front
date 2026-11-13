import { test } from "node:test";
import assert from "node:assert/strict";
import { lc, properNoun } from "./label.ts";

test("Luton keeps its capital in mid-sentence labels, other labels lower-case", () => {
  assert.equal(lc("Luton vans"), "Luton vans");
  assert.equal(lc("Panel vans"), "panel vans");
  assert.equal(`Popular ${properNoun("Luton van")} models`, "Popular Luton van models");
  assert.equal(`Popular ${properNoun("tipper van")} models`, "Popular tipper van models");
});
