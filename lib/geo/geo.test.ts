import test from "node:test";
import assert from "node:assert/strict";
import { GEO } from "./config.ts";
import { isIndexable, stockFor, within } from "./stock.ts";
import { townIntro } from "./intro.ts";
import { CITIES, REGIONS, geoTitle, geoTrail, findGeo, GEO_NODES } from "./tree.ts";

const here = { lat: 51.5, lng: -3.57 };
const van = (lat: number, lng: number) => ({ lat, lng });

test("within: nearest first, skips vans without coordinates", () => {
  const r = within([van(51.5, -3.0), van(51.5, -3.5), { lat: null, lng: null }], (v) => v, here, 25);
  assert.equal(r.length, 2);
  assert.ok(r[0].miles < r[1].miles);
});

test("stockFor expands to 50 miles only when fewer than 6 are inside 25", () => {
  const vans = Array.from({ length: 3 }, () => van(51.5, -3.5));
  const far = [van(51.5, -2.85)];   // about 30 miles east
  const thin = stockFor([...vans, ...far], (v) => v, here);
  assert.equal(thin.expanded, true); assert.equal(thin.radius, 50); assert.equal(thin.vans.length, 4);
  const enough = stockFor([...vans, ...vans, ...far], (v) => v, here);
  assert.equal(enough.expanded, false); assert.equal(enough.vans.length, 6);
});

test("index rule is config-driven", () => {
  assert.equal(isIndexable(6, 0), true);
  assert.equal(isIndexable(5, 0), false);
  assert.equal(isIndexable(0, 1), true);
  assert.equal(isIndexable(2, 0, { indexMinListings: 2, indexMinDealers: 1 }), true);
  assert.equal(GEO.radiusMiles, 25);
});

test("tree: unique keys, every city's region exists, trails", () => {
  const keys = GEO_NODES.map((n) => n.key);
  assert.equal(new Set(keys).size, keys.length);
  for (const [, , region] of CITIES) assert.ok(REGIONS.some((r) => r.key === region), region);
  assert.deepEqual(geoTrail(findGeo("bridgend")!).map((t) => t.key), ["wales", "bridgend"]);
  assert.deepEqual(geoTrail(findGeo("leeds")!).map((t) => t.key), ["england", "yorkshire-and-the-humber", "leeds"]);
  assert.deepEqual(geoTrail(findGeo("scotland")!).map((t) => t.key), ["scotland"]);
  assert.deepEqual(geoTrail(findGeo("london")!).map((t) => t.key), ["england", "london"]);
});

test("titles", () => {
  assert.equal(geoTitle("Glasgow"), "Vans for Sale in Glasgow | Used Vans Glasgow | Vansales");
  assert.equal(geoTitle("Yorkshire and the Humber"), "Vans for Sale in Yorkshire and the Humber | Vansales");
});

test("town intro: about 120 words, no placeholder, handles zero stock", () => {
  const t = townIntro({ town: "Bridgend", county: "Bridgend county borough", region: "Wales", vans: 7, radius: 25, dealers: 2, bodyTypes: ["Panel Van", "Luton", "Tipper"] });
  const words = t.split(/\s+/).length;
  assert.ok(words >= 90 && words <= 150, String(words));
  assert.doesNotMatch(t, /undefined|NaN|\{|\[/);
  assert.match(townIntro({ town: "X", county: "", region: "Wales", vans: 0, radius: 50, dealers: 0, bodyTypes: [] }), /no vans listed/);
});
