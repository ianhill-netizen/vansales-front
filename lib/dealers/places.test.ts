import { test } from "node:test";
import assert from "node:assert/strict";
import { dealerDescription, dealerIndexable, nearestDealers, postcodeArea, regionPageFor, townLabel, townSlug } from "./places.ts";
import { deriveDealerName, dealerDisplayName } from "./display-name.ts";

test("display names: Title Case, no company type, makes keep capitals", () => {
  assert.equal(deriveDealerName("RHYS HUISH COMMERCIALS LIMITED"), "Rhys Huish Commercials");
  assert.equal(deriveDealerName("Motorhub northwest ltd"), "Motorhub Northwest");
  assert.equal(deriveDealerName("vw van centre limited"), "VW Van Centre");
  assert.equal(deriveDealerName("STOKE-ON-TRENT VANS LIMITED"), "Stoke-on-Trent Vans");
  assert.equal(deriveDealerName("O'NEIL VANS OF BRIDGEND LTD"), "O'Neil Vans of Bridgend");
  assert.equal(deriveDealerName("Limited"), "Limited");
  assert.equal(dealerDisplayName({ name: "ACME LTD", display_name: "The Acme Shop" }), "The Acme Shop");
  assert.equal(dealerDisplayName({ name: "ACME LTD", display_name: " " }), "Acme");
});

test("town slugs and labels", () => {
  assert.equal(townSlug("Bridgend"), "bridgend");
  assert.equal(townSlug("St. Helens"), "st-helens");
  assert.equal(townSlug("Knowsley"), "knowsley");
  assert.equal(townLabel("BRIDGEND"), "Bridgend");
  assert.equal(townLabel("Stoke-on-Trent"), "Stoke-on-Trent");
  assert.equal(postcodeArea("cf31 3ap"), "CF");
  assert.equal(postcodeArea(null), "");
});

test("a dealer maps to the regional page whose rule covers it", () => {
  assert.equal(regionPageFor({ town: "Bridgend", county: "Bridgend", postcode: "CF31 3AP" })?.path, "/vans-for-sale/wales");
  assert.equal(regionPageFor({ town: "Bristol", postcode: "BS1 1AA" })?.path, "/vans-for-sale/bristol");
  assert.equal(regionPageFor({ town: "Nowhere", county: "Nowhereshire", postcode: "ZZ1 1ZZ" }), null);
});

test("nearest dealers: closest first, never itself, skips dealers with no coordinates", () => {
  const me = { slug: "a", lat: 51.5, lng: -3.58 };
  const all = [
    { slug: "a", lat: 51.5, lng: -3.58 }, { slug: "far", lat: 55.9, lng: -3.2 }, { slug: "near", lat: 51.52, lng: -3.5 },
    { slug: "mid", lat: 51.9, lng: -3.0 }, { slug: "nolatlng", lat: null, lng: null },
  ];
  assert.deepEqual(nearestDealers(me, all, 3).map((d) => d.slug), ["near", "mid", "far"]);
  assert.deepEqual(nearestDealers({ slug: "x", lat: null, lng: null }, all), []);
});

test("index rule: stock, or an about text, or a configured dealer; otherwise noindex", () => {
  assert.equal(dealerIndexable({ stockCount: 3, hasAbout: false }), true);
  assert.equal(dealerIndexable({ stockCount: 0, hasAbout: true }), true);
  assert.equal(dealerIndexable({ stockCount: 0, hasAbout: false }), false);
  assert.equal(dealerIndexable({ stockCount: 0, hasAbout: false, configured: true }), true);
});

test("dealer descriptions: stock sentence only with stock, finance only where offered, county not repeated", () => {
  assert.equal(dealerDescription({ name: "Swiss Vans", town: "Bridgend", county: "Mid Glamorgan", stock: 6, finance: true }), "Swiss Vans, used van dealer in Bridgend, Mid Glamorgan. 6 vans in stock on Vansales — compare prices, mileage and finance.");
  assert.equal(dealerDescription({ name: "Rhys Huish Commercials", town: "Bridgend", county: "Bridgend", stock: 0, finance: false }), "Rhys Huish Commercials, used van dealer in Bridgend. Compare prices and mileage on Vansales.");
  assert.equal(dealerDescription({ name: "X", town: "", county: "", stock: 1, finance: false }), "X, used van dealer. 1 van in stock on Vansales — compare prices and mileage.");
  assert.ok(dealerDescription({ name: "Rhys Huish Commercials", town: "Bridgend", county: "Bridgend", stock: 12, finance: true }).length <= 160);
});
