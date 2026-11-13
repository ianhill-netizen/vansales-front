import test from "node:test";
import assert from "node:assert/strict";
import { gearboxOf, matchesFilter, parseFilterDefinition, sizeOf, type FilterListing } from "./filter-definition.ts";

const van = (o: Partial<FilterListing> & { make: string; model: string }): FilterListing => ({ derivative: "", van_spec: { body_style: "Panel Van" }, ...o });

test("size: small vans are the compact and car-derived ones, large the full-size, mid-size neither", () => {
  assert.equal(sizeOf({ make: "Volkswagen", model: "Caddy" }), "small");
  assert.equal(sizeOf({ make: "Ford", model: "Transit Connect" }), "small");
  assert.equal(sizeOf({ make: "Ford", model: "Transit" }), "large");
  assert.equal(sizeOf({ make: "Ford", model: "Transit Custom" }), null);
  assert.equal(sizeOf({ make: "Mercedes-Benz", model: "Sprinter" }), "large");
  assert.equal(sizeOf({ make: "Volkswagen", model: "Transporter" }), null);
});

test("gearbox", () => {
  assert.equal(gearboxOf({ transmission: "Automatic" }), "automatic");
  assert.equal(gearboxOf({ transmission: "DSG" }), "automatic");
  assert.equal(gearboxOf({ transmission: "Manual" }), "manual");
  assert.equal(gearboxOf({ transmission: "" }), null);
});

test("vat_qualifying: true is '+ VAT', false is a price with no VAT to add, unknown matches neither", () => {
  const ex = van({ make: "Ford", model: "Transit", vat_status: "ex_vat" });
  const inc = van({ make: "Ford", model: "Transit", vat_status: "inc_vat" });
  const none = van({ make: "Ford", model: "Transit", price_type: "no_vat" });
  const unknown = van({ make: "Ford", model: "Transit" });
  assert.deepEqual([ex, inc, none, unknown].map((l) => matchesFilter({ vat_qualifying: false }, l)), [false, true, true, false]);
  assert.deepEqual([ex, inc, none, unknown].map((l) => matchesFilter({ vat_qualifying: true }, l)), [true, false, false, false]);
});

test("body, text, any and AND of keys; the 4x4 definition still matches what the old rule matched", () => {
  const combi = van({ make: "Ford", model: "Transit Custom", derivative: "320 L1 Combi", van_spec: { body_style: "Combi Van" } });
  assert.equal(matchesFilter({ body: ["combi", "crew"] }, combi), true);
  assert.equal(matchesFilter({ body: ["combi"], size: "small" }, combi), false);
  const fourByFour: Parameters<typeof matchesFilter>[0] = { any: [{ text: ["4x4", "4wd", "awd", "four wheel", "four-wheel", "fourwheel"] }, { make: "land rover", model: "defender" }] };
  assert.equal(matchesFilter(fourByFour, van({ make: "Land Rover", model: "Defender" })), true);
  assert.equal(matchesFilter(fourByFour, van({ make: "Ford", model: "Ranger", derivative: "Wildtrak 4x4 Double Cab" })), true);
  assert.equal(matchesFilter(fourByFour, van({ make: "Ford", model: "Transit", features: ["Four-Wheel Drive"] })), true);
  assert.equal(matchesFilter(fourByFour, van({ make: "Ford", model: "Transit" })), false);
});

test("parseFilterDefinition keeps known keys only and rejects junk", () => {
  assert.deepEqual(parseFilterDefinition({ size: "small", evil: "x" }), { size: "small" });
  assert.equal(parseFilterDefinition({ size: "huge" }), null);
  assert.equal(parseFilterDefinition(null), null);
  assert.equal(parseFilterDefinition([]), null);
  assert.deepEqual(parseFilterDefinition({ any: [{ text: ["a"] }, { bogus: 1 }] }), { any: [{ text: ["a"] }] });
});
