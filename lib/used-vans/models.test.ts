import { test } from "node:test";
import assert from "node:assert/strict";
import { USED_VAN_MODELS, findUsedVanModel, slugify, usedVanMakes, usedVanModelsOfMake, usedVanPath, vansPath } from "./models.ts";

test("there are exactly 31 models with unique page slugs and unique URLs", () => {
  assert.equal(USED_VAN_MODELS.length, 31);
  assert.equal(new Set(USED_VAN_MODELS.map((m) => m.pageSlug)).size, 31);
  assert.equal(new Set(USED_VAN_MODELS.map(usedVanPath)).size, 31);
});

test("page slugs follow the content agent's scheme {make}-{model}-vans-for-sale", () => {
  assert.equal(findUsedVanModel("ford", "transit-custom")?.pageSlug, "ford-transit-custom-vans-for-sale");
  assert.equal(findUsedVanModel("land-rover", "defender")?.pageSlug, "land-rover-defender-vans-for-sale");
  assert.equal(slugify("Mercedes-Benz  Sprinter"), "mercedes-benz-sprinter");
});

test("only the 31 are routable; anything else is undefined", () => {
  assert.equal(findUsedVanModel("ford", "transit")?.model, "Transit");
  assert.equal(findUsedVanModel("ford", "fiesta"), undefined);
  assert.equal(findUsedVanModel("mercedes-benz", "sprinter")?.pageSlug, "mercedes-benz-sprinter-vans-for-sale");
  assert.equal(findUsedVanModel("nissan", "nv200")?.model, "NV200");
  assert.equal(findUsedVanModel("audi", "a3"), undefined);
});

test("makes group their models and URLs mirror the /vans sibling", () => {
  assert.equal(usedVanModelsOfMake("ford").length, 4);
  assert.equal(usedVanModelsOfMake("fiat").length, 2);
  assert.ok(usedVanMakes().every((m) => m.models.length > 0));
  const m = findUsedVanModel("volkswagen", "caddy")!;
  assert.equal(usedVanPath(m), "/used-vans/volkswagen/caddy");
  assert.equal(vansPath(m), "/vans/volkswagen/caddy");
});
