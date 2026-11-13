import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveLegacy } from "./legacy.ts";

const to = (p: string) => resolveLegacy(p)?.to;

test("product-category goes to the body-type page when it names one", () => {
  assert.equal(to("/product-category/dropside/"), "/used-vans/body-type/dropside-for-sale");
  assert.equal(to("/product-category/crew-cab"), "/used-vans/body-type/crew-van-for-sale");
  assert.equal(to("/product-category/pickups/"), "/used-vans/body-type/pickup-for-sale");
  assert.equal(to("/product-category/panel-vans/"), "/used-vans/body-type/panel-van-for-sale");
});

test("product and van slugs go to the model page named in the slug", () => {
  assert.equal(to("/product/citroen-relay-tipper/"), "/used-vans/citroen/relay-for-sale");
  assert.equal(to("/van/iveco-daily-4x4/"), "/used-vans/iveco/daily-for-sale");
  assert.equal(to("/product/vw-transporter-t6-kombi"), "/used-vans/volkswagen/transporter-for-sale");
  assert.equal(to("/product/mercedes-sprinter-314-lwb"), "/used-vans/mercedes-benz/sprinter-for-sale");
  assert.equal(to("/product/ford-transit-custom-320-limited"), "/used-vans/ford/transit-custom-for-sale", "the longest model wins over Transit");
});

test("no model but a make: the make page; no make but a body type: that page; else /vans", () => {
  assert.equal(to("/product/ford-something-unknown"), "/vans/ford-vans-for-sale");
  assert.equal(to("/van/luton-box-van-for-hire"), "/used-vans/body-type/luton-for-sale");
  assert.equal(to("/product/zzz-unknown-thing"), "/vans");
  assert.equal(to("/product-category/accessories"), "/vans");
});

test("anything outside the legacy families is left alone (it stays a 404)", () => {
  assert.equal(resolveLegacy("/get-advice-and-share-your-experiences-along-with-other-single-parents"), null);
  assert.equal(resolveLegacy("/mercedes-sprinter-dimensions"), null);
  assert.equal(resolveLegacy("/vans/ford"), null);
  assert.equal(resolveLegacy("/"), null);
  assert.equal(resolveLegacy("/products"), null);
});

test("every target is a path that exists in the app (no query, absolute, no double slash)", () => {
  for (const p of ["/product/citroen-relay-tipper", "/van/x", "/product-category/tipper", "/product/vw-caddy-maxi"]) {
    const t = to(p)!;
    assert.match(t, /^\/[a-z0-9/-]+$/);
    assert.ok(!t.includes("//"));
  }
});

import { buildRedirects, rootBlogRedirects } from "./all.ts";

test("old root-level post URLs redirect to /blog/{slug}; the generic product families are left to the proxy", () => {
  const root = rootBlogRedirects();
  const sprinter = root.find((r) => r.source === "/mercedes-sprinter-dimensions");
  assert.deepEqual(sprinter && [sprinter.destination, sprinter.statusCode], ["/blog/mercedes-sprinter-dimensions", 301]);
  assert.ok(root.length >= 50, `expected one rule per content/blog post, got ${root.length}`);
  assert.ok(!root.some((r) => ["/blog", "/vans", "/van-finance"].includes(r.source)), "a real route is never redirected");
  const all = buildRedirects();
  assert.ok(!all.some((r) => r.source.startsWith("/product")), "/product* are resolved by proxy.ts");
  assert.ok(all.some((r) => r.source === "/about-us" && r.destination === "/"));
  // every destination of the new rules is a single hop (does not itself redirect)
  const sources = new Set(all.map((r) => r.source));
  for (const r of root) assert.ok(!sources.has(r.destination), r.destination);
});
