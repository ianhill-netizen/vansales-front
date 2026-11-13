import test from "node:test";
import assert from "node:assert/strict";
import { slugify, modelPath } from "./slug.ts";

test("accented letters fold to ASCII instead of becoming a hyphen", () => {
  assert.equal(slugify("Citroën"), "citroen");
  assert.equal(modelPath("Citroën", "Berlingo"), "/used-vans/citroen/berlingo-for-sale", "a model with a /used-vans page links there; /vans/{make}/{model} redirects to it");
  assert.equal(modelPath("Ford", "Tourneo Custom"), "/vans/ford/tourneo-custom");
  assert.equal(slugify("Škoda Fabia"), "skoda-fabia");
});

test("existing slugs are unchanged", () => {
  assert.equal(slugify("Mercedes-Benz"), "mercedes-benz");
  assert.equal(slugify("Transit Custom"), "transit-custom");
  assert.equal(slugify("Land Rover"), "land-rover");
  assert.equal(slugify("  Ford's  Transit "), "fords-transit");
});
