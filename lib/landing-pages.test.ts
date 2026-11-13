import { test } from "node:test";
import assert from "node:assert/strict";
import { LANDING_PAGES, LANDING_BACKEND_SLUGS, findLanding, findRegion } from "./landing-pages.ts";

test("twenty-three pages at the twenty-three URLs with unique, in-limit copy", () => {
  assert.deepEqual(LANDING_PAGES.map((p) => p.path), ["/van-lease-deals", "/electric-vans", "/vans-for-sale/london", "/hire-purchase-vans", "/vans-for-sale/wales", "/vans-for-sale/bristol", "/vans-for-sale-under-5000", "/vans-for-sale-under-10000", "/vans-for-sale-under-15000", "/bad-credit-van-finance", "/van-finance-calculator", "/vans-for-sale/manchester", "/vans-for-sale/birmingham", "/vans-for-sale/leeds", "/vans-for-sale/scotland", "/byd-vans-uk", "/maxus-vans-uk", "/leapmotor-vans-uk", "/changan-vans-uk", "/sell-van-quickly", "/part-exchange-van", "/van-news-uk", "/new-vans-2026"]);
  assert.equal(new Set(LANDING_PAGES.map((p) => p.title)).size, 23);
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
  const at = (town: string, region: string, postcode_area: string) => ({ fuel: "Diesel", location: { town, region, postcode_area } });
  assert.equal(findLanding("wales")!.match!(at("Cardiff", "South Glamorgan", "CF")), true);
  assert.equal(findLanding("wales")!.match!(at("Rhyl", "", "LL")), true);
  assert.equal(findLanding("wales")!.match!(at("Leeds", "West Yorkshire", "LS")), false);
  assert.equal(findLanding("bristol")!.match!(at("Filton", "Gloucestershire", "BS")), true);
  assert.equal(findLanding("bristol")!.match!(at("Bath", "Somerset", "BA")), false);
  assert.equal(findLanding("van-lease-deals")!.match, undefined);
});

test("the region route knows the seven regions; backend slugs are the content_pages slugs", () => {
  assert.equal(findRegion("london")?.path, "/vans-for-sale/london");
  assert.equal(findRegion("wales")?.path, "/vans-for-sale/wales");
  assert.equal(findRegion("bristol")?.path, "/vans-for-sale/bristol");
  assert.equal(findRegion("scotland")?.path, "/vans-for-sale/scotland");
  assert.equal(findRegion("northern-ireland"), undefined);
  assert.equal(findRegion("electric-vans"), undefined);
  assert.deepEqual([...LANDING_BACKEND_SLUGS].sort(), ["bad-credit-van-finance", "byd-vans-uk", "changan-vans-uk", "electric-vans", "hire-purchase-vans", "leapmotor-vans-uk", "maxus-vans-uk", "new-vans-2026", "part-exchange-van", "sell-van-quickly", "used-van-warranty-guide-uk", "used-van-warranty-options", "van-finance-calculator", "van-lease-deals", "van-news-uk", "van-reviews", "vans-for-sale-birmingham", "vans-for-sale-bristol", "vans-for-sale-leeds", "vans-for-sale-london", "vans-for-sale-manchester", "vans-for-sale-scotland", "vans-for-sale-under-10000", "vans-for-sale-under-15000", "vans-for-sale-under-5000", "vans-for-sale-wales"]);
});

test("budget pages: price caps one pound under the budget, each links to /van-finance and the next tier up", () => {
  const caps = ["5000", "10000", "15000"].map((k) => findLanding(`vans-for-sale-under-${k}`)!);
  assert.deepEqual(caps.map((c) => c.maxPrice), [4999, 9999, 14999]);
  assert.ok(caps[0].related.some((r) => r.href === "/vans-for-sale-under-10000"));
  assert.ok(caps[1].related.some((r) => r.href === "/vans-for-sale-under-15000"));
  for (const c of caps) assert.ok(c.related.some((r) => r.href === "/van-finance"));
  assert.equal(findRegion("vans-for-sale-under-5000"), undefined);
});

test("the four new regions match their own towns and postcode areas and nobody else's", () => {
  const at = (town: string, region: string, postcode_area: string) => ({ fuel: "Diesel", location: { town, region, postcode_area } });
  const m = (key: string, l: ReturnType<typeof at>) => findLanding(key)!.match!(l);
  assert.equal(m("manchester", at("Salford", "Greater Manchester", "M")), true);
  assert.equal(m("manchester", at("Stockport", "", "SK")), true);
  assert.equal(m("manchester", at("Newbury", "Berkshire", "RG")), false); // "bury" inside another word must not match
  assert.equal(m("birmingham", at("Wolverhampton", "West Midlands", "WV")), true);
  assert.equal(m("birmingham", at("Bath", "Somerset", "BA")), false);     // "B" is Birmingham only as a whole postcode area
  assert.equal(m("leeds", at("Bradford", "West Yorkshire", "BD")), true);
  assert.equal(m("leeds", at("York", "North Yorkshire", "YO")), false);
  assert.equal(m("scotland", at("Glasgow", "", "G")), true);
  assert.equal(m("scotland", at("Aberdeen", "Aberdeenshire", "AB")), true);
  assert.equal(m("scotland", at("Gloucester", "Gloucestershire", "GL")), false); // "G" is Glasgow, not every G-postcode
  assert.equal(m("scotland", at("Cardiff", "South Glamorgan", "CF")), false);
  for (const k of ["manchester", "birmingham", "leeds", "scotland"]) assert.equal(findLanding(k)!.kind, "buying");
});
