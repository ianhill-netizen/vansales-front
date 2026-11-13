import { test } from "node:test";
import assert from "node:assert/strict";
import { USED_VAN_MODELS, commonMake, findUsedVanModel, findUsedVanModelByParam, slugify, usedVanDescription, usedVanH1, usedVanMakes, usedVanModelsOfMake, usedVanOldPath, usedVanPath, usedVanTitle, vansPath } from "./models.ts";

test("there are exactly 62 models with unique page slugs and unique URLs", () => {
  assert.equal(USED_VAN_MODELS.length, 62);
  assert.equal(new Set(USED_VAN_MODELS.map((m) => m.pageSlug)).size, 62);
  assert.equal(new Set(USED_VAN_MODELS.map(usedVanPath)).size, 62);
});

test("page slugs follow the content agent's scheme {make}-{model}-vans-for-sale", () => {
  assert.equal(findUsedVanModel("ford", "transit-custom")?.pageSlug, "ford-transit-custom-vans-for-sale");
  assert.equal(findUsedVanModel("land-rover", "defender")?.pageSlug, "land-rover-defender-vans-for-sale");
  assert.equal(slugify("Mercedes-Benz  Sprinter"), "mercedes-benz-sprinter");
});

test("only the 62 are routable; anything else is undefined", () => {
  assert.equal(findUsedVanModel("ford", "transit")?.model, "Transit");
  assert.equal(findUsedVanModel("ford", "fiesta"), undefined);
  assert.equal(findUsedVanModel("mercedes-benz", "sprinter")?.pageSlug, "mercedes-benz-sprinter-vans-for-sale");
  assert.equal(findUsedVanModel("nissan", "nv200")?.model, "NV200");
  assert.equal(findUsedVanModel("audi", "a3"), undefined);
});

test("makes group their models; the stock link is the /vans chip filter", () => {
  assert.equal(usedVanModelsOfMake("ford").length, 7);
  assert.equal(usedVanModelsOfMake("fiat").length, 5);
  assert.ok(usedVanMakes().every((m) => m.models.length > 0));
  const m = findUsedVanModel("volkswagen", "caddy")!;
  assert.equal(usedVanPath(m), "/used-vans/volkswagen/caddy-for-sale");
  assert.equal(usedVanOldPath(m), "/used-vans/volkswagen/caddy");
  assert.equal(vansPath(m), "/vans?v=volkswagen:caddy");
});

test("the -for-sale URL is the only page, and the old URL does not resolve", () => {
  assert.equal(findUsedVanModelByParam("ford", "transit-custom-for-sale")?.model, "Transit Custom");
  assert.equal(findUsedVanModelByParam("ford", "transit-custom"), undefined);
  assert.equal(findUsedVanModelByParam("ford", "fiesta-for-sale"), undefined);
  assert.ok(USED_VAN_MODELS.every((m) => usedVanPath(m).endsWith("-for-sale") && !usedVanOldPath(m).endsWith("-for-sale")));
});

test("H1, title and description use the common names (VW, Merc) and the exact patterns", () => {
  const caddy = findUsedVanModel("volkswagen", "caddy")!;
  const sprinter = findUsedVanModel("mercedes-benz", "sprinter")!;
  assert.equal(commonMake("Volkswagen"), "VW");
  assert.equal(usedVanH1(caddy), "Used VW Caddy For Sale");
  assert.equal(usedVanH1(sprinter), "Used Merc Sprinter For Sale");
  assert.equal(usedVanH1(findUsedVanModel("ford", "transit-custom")!), "Used Ford Transit Custom For Sale");
  assert.equal(usedVanTitle(caddy), "Used VW Caddy For Sale | Vansales.com");
  assert.equal(usedVanDescription(caddy), "Browse used VW Caddy vans for sale from verified UK dealers. Compare prices, specs and mileage. No nonsense.");
  for (const m of USED_VAN_MODELS) assert.ok(usedVanDescription(m).length <= 160, m.pageSlug);
});

test("the 31 added models: slugs the content agent already published, URLs as briefed", () => {
  const url = (make: string, model: string) => usedVanPath(findUsedVanModel(make, model)!);
  assert.equal(url("ford", "e-transit"), "/used-vans/ford/e-transit-for-sale");
  assert.equal(url("volkswagen", "id-buzz-cargo"), "/used-vans/volkswagen/id-buzz-cargo-for-sale", "the URL follows the stock slug");
  assert.equal(findUsedVanModel("volkswagen", "id-buzz-cargo")?.pageSlug, "volkswagen-idbuzz-cargo-vans-for-sale", "the published content slug is unchanged");
  assert.equal(findUsedVanModel("volkswagen", "idbuzz-cargo"), undefined);
  assert.equal(url("maxus", "deliver-9"), "/used-vans/maxus/deliver-9-for-sale");
  assert.equal(url("vauxhall", "vivaro-electric"), "/used-vans/vauxhall/vivaro-electric-for-sale");
  assert.equal(url("ldv", "convoy"), "/used-vans/ldv/convoy-for-sale");
  assert.equal(findUsedVanModel("mercedes-benz", "esprinter")?.pageSlug, "mercedes-benz-esprinter-vans-for-sale");
  assert.equal(findUsedVanModel("byd", "et3")?.pageSlug, "byd-et3-vans-for-sale");
  assert.equal(USED_VAN_MODELS.slice(31).length, 31);
});
