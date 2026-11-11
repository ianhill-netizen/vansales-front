import test from "node:test";
import assert from "node:assert/strict";
import { fitTitle, stripBrand } from "./title.ts";

const SUFFIX = " · Vansales";

test("a title that fits is returned unchanged", () => {
  assert.equal(fitTitle("Ford Transit Sizes: Your Complete Guide", SUFFIX), "Ford Transit Sizes: Your Complete Guide");
});

test("never cuts mid-word and leaves no dangling punctuation", () => {
  const t = fitTitle("Tax Implications of Owning a Land Rover Defender Commercial: What Every Business Owner Must Know", SUFFIX);
  assert.equal(t, "Tax Implications of Owning a Land Rover Defender Commercial");
  const u = fitTitle("How to Change Headlight Bulb on Citroen Berlingo Van: A Complete Guide", SUFFIX);
  assert.ok("How to Change Headlight Bulb on Citroen Berlingo Van: A Complete Guide".startsWith(u));
  assert.ok(u.length + SUFFIX.length <= 70);
  assert.equal(u, "How to Change Headlight Bulb on Citroen Berlingo Van");
});

test("the suffix counts against the limit", () => {
  const long = "word ".repeat(30).trim();
  assert.ok(fitTitle(long, SUFFIX).length + SUFFIX.length <= 70);
  assert.ok(fitTitle(long, "").length <= 70);
});

test("a single over-long word is kept whole", () => {
  assert.equal(fitTitle("Supercalifragilisticexpialidocious".repeat(4), SUFFIX), "Supercalifragilisticexpialidocious".repeat(4));
});

test("a brand the title already carries is removed (the layout adds it once)", () => {
  assert.equal(stripBrand("Used Van HPI Check Guide | vansales.com"), "Used Van HPI Check Guide");
  assert.equal(stripBrand("Best Used Pickup Trucks UK: Top 5 Reliable Picks | Vansales."), "Best Used Pickup Trucks UK: Top 5 Reliable Picks");
  assert.equal(stripBrand("Van Finance Options Explained | vansales.com UK Guide"), "Van Finance Options Explained | UK Guide");
  assert.equal(stripBrand("Used Van MOT History Guide: Red Flags & Checks | vansales.co"), "Used Van MOT History Guide: Red Flags & Checks");
  assert.equal(stripBrand("Why Vansales Exists"), "Why Vansales Exists");   // only a brand after a separator is a suffix
  assert.equal(fitTitle("Used Tipper Van Buying Guide | Vansales.com", SUFFIX), "Used Tipper Van Buying Guide");
});
