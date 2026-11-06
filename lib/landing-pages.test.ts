import { test } from "node:test";
import assert from "node:assert/strict";
import { LANDING_PAGES, LANDING_BACKEND_SLUGS, findLanding, findRegion } from "./landing-pages.ts";

test("four pages at the four URLs with unique, in-limit copy", () => {
  assert.deepEqual(LANDING_PAGES.map((p) => p.path), ["/van-lease-deals", "/electric-vans", "/vans-for-sale/london", "/hire-purchase-vans"]);
  assert.equal(new Set(LANDING_PAGES.map((p) => p.title)).size, 4);
  for (const p of LANDING_PAGES) {
    assert.ok(p.description.length <= 160, p.key);
    assert.ok(p.title.length <= 60 && p.title.endsWith("Vansales.com"), p.key);
    assert.ok(p.related.length >= 2 && p.related.some((r) => r.href === "/van-finance"), p.key);
  }
});

test("buying pages filter stock, guide pages do not", () => {
  const van = (fuel: string, town: string, region: string) => ({ fuel, location: { town, region } });
  assert.equal(findLanding("electric-vans")!.match!(van("Electric", "Leeds", "West Yorkshire")), true);
  assert.equal(findLanding("electric-vans")!.match!(van("Diesel", "Leeds", "West Yorkshire")), false);
  assert.equal(findLanding("london")!.match!(van("Diesel", "Croydon", "Greater London")), true);
  assert.equal(findLanding("london")!.match!(van("Diesel", "Cardiff", "South Glamorgan")), false);
  assert.equal(findLanding("van-lease-deals")!.match, undefined);
});

test("region route only knows london; backend slugs are the four content_pages slugs", () => {
  assert.equal(findRegion("london")?.path, "/vans-for-sale/london");
  assert.equal(findRegion("wales"), undefined);
  assert.equal(findRegion("electric-vans"), undefined);
  assert.deepEqual([...LANDING_BACKEND_SLUGS].sort(), ["electric-vans", "hire-purchase-vans", "van-lease-deals", "vans-for-sale-london"]);
});
