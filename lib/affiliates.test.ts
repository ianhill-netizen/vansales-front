import test from "node:test";
import assert from "node:assert/strict";
import { affiliateFor } from "./affiliates.ts";

test("affiliate is hidden until its env is set to an https URL", () => {
  assert.equal(affiliateFor("INSURANCE", {}), null);
  assert.equal(affiliateFor("INSURANCE", { AFF_INSURANCE_URL: "" }), null);
  assert.equal(affiliateFor("INSURANCE", { AFF_INSURANCE_URL: "   " }), null);
  assert.equal(affiliateFor("INSURANCE", { AFF_INSURANCE_URL: "http://example.com/x" }), null);
  assert.equal(affiliateFor("INSURANCE", { AFF_INSURANCE_URL: "javascript:alert(1)" }), null);
  assert.equal(affiliateFor("INSURANCE", { AFF_INSURANCE_URL: "not a url" }), null);
});

test("affiliate resolves with a default or custom label", () => {
  assert.deepEqual(affiliateFor("INSURANCE", { AFF_INSURANCE_URL: "https://example.com/go?a=1" }), { href: "https://example.com/go?a=1", label: "Visit our van insurance partner" });
  assert.equal(affiliateFor("INSURANCE", { AFF_INSURANCE_URL: "https://example.com/", AFF_INSURANCE_LABEL: "Go" })?.label, "Go");
});
