import { test } from "node:test";
import assert from "node:assert/strict";
import { ACCESSORIES, ACCESSORY_BACKEND_SLUGS, ACCESSORY_HUB } from "./accessories.ts";

test("ten topics, unique slugs, titles within 60 characters", () => {
  assert.equal(ACCESSORIES.length, 10);
  assert.equal(new Set(ACCESSORIES.map((a) => a.slug)).size, 10);
  for (const a of ACCESSORIES) assert.ok(a.title.length <= 70 && a.path === `/van-accessories/${a.slug}` && a.backendSlug === `accessory-${a.slug}`, a.slug);
  assert.equal(ACCESSORY_HUB.title, "Van Accessories UK: Racking, Ply Lining, Security & More | Vansales");
  assert.equal(ACCESSORY_BACKEND_SLUGS.length, 11);
});
