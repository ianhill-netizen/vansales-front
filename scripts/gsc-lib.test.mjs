import { test } from "node:test";
import assert from "node:assert/strict";
import { bucket, chunk, delayMs, parseUrlList, sitemapLocs, toCsv } from "./gsc-lib.mjs";

test("sitemapLocs reads an index and a urlset, decoding &amp;", () => {
  assert.deepEqual(sitemapLocs("<sitemapindex><sitemap><loc>https://a/x.xml</loc></sitemap></sitemapindex>"), ["https://a/x.xml"]);
  assert.deepEqual(sitemapLocs("<urlset><url><loc> https://a/p?a=1&amp;b=2 </loc></url><url><loc>https://a/q</loc></url></urlset>"), ["https://a/p?a=1&b=2", "https://a/q"]);
});

test("parseUrlList drops blanks, comments and duplicates", () => {
  assert.deepEqual(parseUrlList("# top\nhttps://a/1\n\n https://a/2 \nhttps://a/1\r\n"), ["https://a/1", "https://a/2"]);
});

test("toCsv quotes commas, quotes and newlines", () => {
  assert.equal(toCsv(["u", "t"], [{ u: "https://a", t: 'He said "hi", ok' }, { u: "https://b", t: null }]), 'u,t\nhttps://a,"He said ""hi"", ok"\nhttps://b,\n');
});

test("bucket maps coverage states to the Pages-report groups", () => {
  assert.equal(bucket("Not found (404)"), "not_found_404");
  assert.equal(bucket("Crawled - currently not indexed"), "crawled_not_indexed");
  assert.equal(bucket("Discovered - currently not indexed"), "discovered_not_indexed");
  assert.equal(bucket("Submitted and indexed", "PASS"), "indexed");
  assert.equal(bucket("Excluded by 'noindex' tag"), "excluded_noindex");
  assert.equal(bucket("Page with redirect"), "page_with_redirect");
  assert.equal(bucket("Something new"), "other");
});

test("rate helpers", () => {
  assert.equal(delayMs(600), 100);
  assert.deepEqual(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
});
