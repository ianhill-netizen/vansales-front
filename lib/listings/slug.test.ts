import test from "node:test";
import assert from "node:assert/strict";
import { slugify, modelPath } from "./slug.ts";

test("accented letters fold to ASCII instead of becoming a hyphen", () => {
  assert.equal(slugify("Citroën"), "citroen");
  assert.equal(modelPath("Citroën", "Berlingo"), "/vans/citroen/berlingo");
  assert.equal(slugify("Škoda Fabia"), "skoda-fabia");
});

test("existing slugs are unchanged", () => {
  assert.equal(slugify("Mercedes-Benz"), "mercedes-benz");
  assert.equal(slugify("Transit Custom"), "transit-custom");
  assert.equal(slugify("Land Rover"), "land-rover");
  assert.equal(slugify("  Ford's  Transit "), "fords-transit");
});
