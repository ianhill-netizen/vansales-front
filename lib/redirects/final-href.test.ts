import test from "node:test";
import assert from "node:assert/strict";
import { finalHref } from "./final-href.ts";
import { sanitizeGuideHtml } from "../content/sanitize.ts";
import { mdToHtml } from "../content/markdown.ts";
import { buildRedirects } from "./all.ts";

test("old stock URLs resolve to where the page lives now, in one step", () => {
  assert.equal(finalHref("/vans/ford/transit-custom"), "/used-vans/ford/transit-custom-for-sale");
  assert.equal(finalHref("/vans/volkswagen/transporter"), "/used-vans/volkswagen/transporter-for-sale");
  assert.equal(finalHref("/used-vans/body-type/panel-van"), "/used-vans/body-type/panel-van-for-sale");
  assert.equal(finalHref("/vans/panel-van"), "/used-vans/body-type/panel-van-for-sale");
  assert.equal(finalHref("/vans/ford"), "/vans/ford-vans-for-sale");
  assert.equal(finalHref("/vans/electric"), "/electric-vans");
  assert.equal(finalHref("/blog/used-van-warranty-options"), "/van-warranty");
});
test("query, hash and trailing slash are kept or tidied; live URLs and other hosts are untouched", () => {
  assert.equal(finalHref("/vans/ford/transit-custom?x=1#a"), "/used-vans/ford/transit-custom-for-sale?x=1#a");
  assert.equal(finalHref("/vans/ford/transit-custom/"), "/used-vans/ford/transit-custom-for-sale");
  for (const live of ["/", "/vans", "/used-vans", "/vans/ford-vans-for-sale", "/vans/ulez", "/used-vans/ford/transit-for-sale", "/blog/some-live-post", "https://example.com/vans/ford", "//cdn.example.com/x"]) assert.equal(finalHref(live), live);
});
test("the result of finalHref never redirects again", () => {
  const exact = new Set(buildRedirects().filter((r) => !/[:*(]/.test(r.source)).map((r) => r.source.toLowerCase()));
  for (const r of buildRedirects().filter((x) => !/[:*(]/.test(x.source))) { const to = finalHref(r.source); assert.ok(!exact.has(to.toLowerCase()), `${r.source} -> ${to} still redirects`); }
});
test("sanitised bodies and markdown posts link straight to the final URL", () => {
  assert.match(sanitizeGuideHtml('<p><a href="/vans/ford/transit-custom">Transit Custom</a> <a href="https://example.com/vans/ford">x</a></p>'), /href="\/used-vans\/ford\/transit-custom-for-sale"[^>]*>Transit Custom<\/a> <a href="https:\/\/example\.com\/vans\/ford"/);
  assert.match(mdToHtml("See [panel vans](/used-vans/body-type/panel-van)."), /href="\/used-vans\/body-type\/panel-van-for-sale"/);
});
