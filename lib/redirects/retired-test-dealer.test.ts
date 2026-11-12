import test from "node:test";
import assert from "node:assert/strict";
import { RETIRED_TEST_DEALER_REDIRECTS, RETIRED_TEST_DEALER_SLUG } from "./retired-test-dealer.ts";
import { buildRedirects } from "./all.ts";

test("Van Viking's dealer page and all eight listings are permanent redirects", () => {
  const sources = RETIRED_TEST_DEALER_REDIRECTS.map((r) => r.source);
  assert.ok(sources.includes(`/dealer/${RETIRED_TEST_DEALER_SLUG}`));
  assert.equal(sources.filter((s) => s.startsWith("/listing/dealer-")).length, 8);
  for (const r of RETIRED_TEST_DEALER_REDIRECTS) assert.equal(r.statusCode, 301);
});

test("the dealer page goes to the directory and every listing to a model guide page", () => {
  for (const r of RETIRED_TEST_DEALER_REDIRECTS) {
    if (r.source.startsWith("/dealer/")) assert.equal(r.destination, "/dealers");
    else assert.match(r.destination, /^\/used-vans\/[a-z0-9-]+\/[a-z0-9-]+-for-sale$/);
  }
});

test("they are part of the site's redirect list", () => {
  const all = new Set(buildRedirects().map((r) => r.source));
  for (const r of RETIRED_TEST_DEALER_REDIRECTS) assert.ok(all.has(r.source), r.source);
});

test("the retired dogfood NV200 advert is a single-hop 301 to its model guide page", () => {
  const r = RETIRED_TEST_DEALER_REDIRECTS.find((x) => x.source === "/listing/private-nissan-nv200-2011-1");
  assert.ok(r);
  assert.equal(r.destination, "/used-vans/nissan/nv200-for-sale");
  assert.equal(r.statusCode, 301);
});
