import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_LABEL, isAwinUrl, parsePlacements } from "./affiliates.ts";

const URL_OK = "https://www.awin1.com/cread.php?s=1013088&v=7857&q=316409&r=573373";

test("only an https awin1.com link is renderable", () => {
  assert.equal(isAwinUrl(URL_OK), true);
  assert.equal(isAwinUrl("http://www.awin1.com/cread.php?s=1"), false);
  assert.equal(isAwinUrl("https://www.awin1.com.evil.example/x"), false);
  assert.equal(isAwinUrl("https://example.com/"), false);
  assert.equal(isAwinUrl("javascript:alert(1)"), false);
  assert.equal(isAwinUrl(null), false);
});

test("placements: validated, labelled, junk dropped, empty when the answer is not the expected shape", () => {
  assert.deepEqual(parsePlacements({ data: [{ advertiser_id: 7857, label: null, tracking_url: URL_OK }] }), [{ advertiserId: 7857, href: URL_OK, label: DEFAULT_LABEL }]);
  assert.equal(parsePlacements({ data: [{ advertiser_id: 1, label: "Go", tracking_url: URL_OK }] })[0].label, "Go");
  assert.deepEqual(parsePlacements({ data: [{ advertiser_id: 1, tracking_url: "https://evil.example/" }, { tracking_url: 5 }, null] }), []);
  assert.deepEqual(parsePlacements({ data: "nope" }), []);
  assert.deepEqual(parsePlacements(null), []);
});
