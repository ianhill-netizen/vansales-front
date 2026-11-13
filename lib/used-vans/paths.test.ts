import { test } from "node:test";
import assert from "node:assert/strict";
import { MOVED_CATEGORY_SLUGS, categoryPath, modelPagePath, modelStockHref } from "./paths.ts";
import { USED_VAN_MODELS } from "./models.ts";

test("the eight stock categories point at their body-type pages; the rest stay", () => {
  assert.deepEqual([...MOVED_CATEGORY_SLUGS].sort(), ["chassis-cab", "crew-van", "dropside", "luton", "minibus", "panel-van", "pickup", "tipper"]);
  assert.equal(categoryPath("luton"), "/used-vans/body-type/luton-for-sale");
  assert.equal(categoryPath("pickup"), "/used-vans/body-type/pickup-for-sale");
  assert.equal(categoryPath("electric"), "/electric-vans");
  assert.equal(categoryPath("ulez"), "/vans/ulez");
});

test("a model with a /used-vans page links there; others keep the stock page", () => {
  assert.equal(modelPagePath("ford", "transit-custom"), "/used-vans/ford/transit-custom-for-sale");
  assert.equal(modelPagePath("volkswagen", "id-buzz-cargo"), "/used-vans/volkswagen/id-buzz-cargo-for-sale");
  assert.equal(modelPagePath("ford", "tourneo-custom"), "/vans/ford/tourneo-custom");
  assert.equal(modelStockHref("ford", "transit-custom"), "/vans?v=ford:transit-custom");
});

test("the ID.Buzz Cargo page keeps its published content slug while the URL uses the stock slug", () => {
  const m = USED_VAN_MODELS.find((x) => x.modelSlug === "id-buzz-cargo")!;
  assert.equal(m.pageSlug, "volkswagen-idbuzz-cargo-vans-for-sale");
});

import { canonicalDestination } from "./paths.ts";
test("redirect destinations that name an old stock URL are rewritten to the new home", () => {
  assert.equal(canonicalDestination("/vans/minibus"), "/used-vans/body-type/minibus-for-sale");
  assert.equal(canonicalDestination("/vans/ford/transit"), "/used-vans/ford/transit-for-sale");
  assert.equal(canonicalDestination("/vans/ford/tourneo-custom"), "/vans/ford/tourneo-custom", "no /used-vans page for it: unchanged");
  assert.equal(canonicalDestination("/vans/ulez"), "/vans/ulez");
  assert.equal(canonicalDestination("/vans"), "/vans");
  assert.equal(canonicalDestination("/vans/ford-vans-for-sale"), "/vans/ford-vans-for-sale");
});
