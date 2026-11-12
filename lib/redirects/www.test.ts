import test from "node:test";
import assert from "node:assert/strict";
import { APEX_ORIGIN, WWW_HOST, WWW_TO_APEX_REDIRECT } from "./www.ts";
import { isRetiredDealerSlug } from "./retired-test-dealer.ts";

test("www goes to the apex with a 301, path kept, and only for the www host", () => {
  assert.equal(WWW_TO_APEX_REDIRECT.statusCode, 301);
  assert.equal(WWW_TO_APEX_REDIRECT.destination, `${APEX_ORIGIN}/:path*`);
  assert.deepEqual(WWW_TO_APEX_REDIRECT.has, [{ type: "host", value: WWW_HOST }]);
  assert.ok(!APEX_ORIGIN.includes("www."));
});

test("the retired dealer is recognised so /dealers and the sitemap leave it out", () => {
  assert.equal(isRetiredDealerSlug("van-viking"), true);
  assert.equal(isRetiredDealerSlug("swiss-vans"), false);
});
