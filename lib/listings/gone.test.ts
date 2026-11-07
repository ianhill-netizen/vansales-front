import { test } from "node:test";
import assert from "node:assert/strict";
import { goneTarget, isListingSlug, backendSlug, GONE_FALLBACK } from "./gone.ts";

test("backend make and model win: the model's guide page", () => {
  assert.equal(goneTarget("x-1", { make: "Ford", model: "Transit" }), "/used-vans/ford/transit-for-sale");
  assert.equal(goneTarget("x-1", { make: "FORD", model: "TRANSIT CUSTOM 320 L2H1" }), "/used-vans/ford/transit-custom-for-sale"); // longest model wins, not transit
  assert.equal(goneTarget("x-1", { make: "Mercedes-Benz", model: "Sprinter" }), "/used-vans/mercedes-benz/sprinter-for-sale");
  assert.equal(goneTarget("x-1", { make: "Land Rover", model: "Defender 110" }), "/used-vans/land-rover/defender-for-sale");
  assert.equal(goneTarget("x-1", { make: "Toyota", model: "Hilux Invincible X" }), "/used-vans/toyota/hilux-invincible-for-sale");
});

test("a model with no guide goes to its make's stock page; an unknown make falls through to the slug", () => {
  assert.equal(goneTarget("x-1", { make: "Iveco", model: "Eurocargo" }), "/vans/iveco-vans-for-sale");
  assert.equal(goneTarget("x-1", { make: "Ford", model: null }), "/vans/ford-vans-for-sale");
  assert.equal(goneTarget("ford-transit-2019-10", { make: "Zorblax", model: "Q" }), "/used-vans/ford/transit-for-sale");
});

test("no backend data: the slug carries the make and model (both slug shapes)", () => {
  assert.equal(goneTarget("dealer-ford-transit-2019-10"), "/used-vans/ford/transit-for-sale");
  assert.equal(goneTarget("private-nissan-nv200-2011-1"), "/used-vans/nissan/nv200-for-sale");
  assert.equal(goneTarget("ford-transit-custom-320-l2-h2-trend-leeds-481516"), "/used-vans/ford/transit-custom-for-sale");
  assert.equal(goneTarget("mercedes-benz-sprinter-314-cdi-2019-77"), "/used-vans/mercedes-benz/sprinter-for-sale");
  assert.equal(goneTarget("land-rover-defender-hdtp-xdyn-hse-dmhev-a-2026-8"), "/used-vans/land-rover/defender-for-sale");
  assert.equal(goneTarget("iveco-eurocargo-2015-9"), "/vans/iveco-vans-for-sale");
});

test("genuinely unknown: /used-vans", () => {
  assert.equal(goneTarget("zzz-unknown-van-123"), GONE_FALLBACK);
  assert.equal(GONE_FALLBACK, "/used-vans");
  assert.equal(goneTarget("x-1", { make: "", model: "" }), GONE_FALLBACK);
});

test("only real-looking listing slugs are redirected; junk stays a 404", () => {
  for (const ok of ["dealer-ford-transit-2019-10", "private-nissan-nv200-2011-1", "ford-transit-12345", "ford-transit-custom-leeds-cmabc123def456ghi789jkl0"]) assert.equal(isListingSlug(ok), true, ok);
  for (const bad of ["asdf", "foo-bar", "Ford-Transit-1", "ford_transit-1", "a".repeat(201), "-ford-1", "ford--transit-1", ""]) assert.equal(isListingSlug(bad), false, bad);
});

test("the front's dealer-/private- prefix is removed for the backend", () => {
  assert.equal(backendSlug("dealer-ford-transit-2019-10"), "ford-transit-2019-10");
  assert.equal(backendSlug("private-nissan-nv200-2011-1"), "nissan-nv200-2011-1");
  assert.equal(backendSlug("ford-transit-12345"), "ford-transit-12345");
});
