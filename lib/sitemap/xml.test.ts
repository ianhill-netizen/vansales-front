import test from "node:test";
import assert from "node:assert/strict";
import { GROUPS, dedupeEntries, groupOf, newestLastmod, sitemapIndexXml, splitByGroup, urlsetXml, validLastmod } from "./xml.ts";

const NOW = Date.parse("2026-11-12T14:00:00Z");
const B = "https://vansales.com";

test("lastmod is only a real date: empty, garbage, pre-2000 and future values are dropped, never invented", () => {
  assert.equal(validLastmod(undefined, NOW), undefined);
  assert.equal(validLastmod(null, NOW), undefined);
  assert.equal(validLastmod("", NOW), undefined);
  assert.equal(validLastmod("not a date", NOW), undefined);
  assert.equal(validLastmod("1970-01-01T00:00:00Z", NOW), undefined);
  assert.equal(validLastmod("2027-06-01T00:00:00Z", NOW), undefined);
  assert.equal(validLastmod("2025-07-30T09:42:46", NOW)?.slice(0, 10), "2025-07-30");
  assert.equal(validLastmod(new Date("2026-11-05T14:48:28Z"), NOW), "2026-11-05T14:48:28.000Z");
});

test("an entry with no date gets no <lastmod> tag, and changefreq/priority are never written", () => {
  const xml = urlsetXml([{ url: `${B}/a` }, { url: `${B}/b`, lastModified: "2026-11-05T14:48:28Z" }, { url: `${B}/c`, lastModified: "junk" }], NOW);
  assert.equal((xml.match(/<lastmod>/g) ?? []).length, 1);
  assert.ok(!/changefreq|priority/.test(xml));
  assert.ok(xml.includes("<loc>https://vansales.com/a</loc></url>"));
});

test("urls are XML-escaped", () => {
  assert.ok(urlsetXml([{ url: `${B}/x?a=1&b=2` }]).includes("a=1&amp;b=2"));
});

test("dedupe keeps the first of a repeated URL (trailing slash and case ignored)", () => {
  const out = dedupeEntries([{ url: `${B}/blog/a`, lastModified: "2026-01-01" }, { url: `${B}/blog/a/` }, { url: `${B}/Blog/A` }, { url: `${B}/blog/b` }]);
  assert.deepEqual(out.map((e) => e.url), [`${B}/blog/a`, `${B}/blog/b`]);
});

test("every URL lands in exactly one child sitemap, and the children together cover all of them", () => {
  const paths = ["/", "/vans", "/vans/ford/transit", "/blog", "/blog/x", "/van-news", "/van-news/y", "/used-vans", "/used-vans/ford", "/used-vans/body-type/luton-for-sale", "/dealers", "/dealer/swiss-vans", "/listing/dealer-ford-1", "/van-finance", "/vans-for-sale/london", "/byd-vans-uk"];
  const entries = paths.map((p) => ({ url: `${B}${p}` }));
  const split = splitByGroup(entries);
  assert.deepEqual(Object.keys(split).sort(), [...GROUPS].sort());
  const all = GROUPS.flatMap((g) => split[g].map((e) => e.url));
  assert.equal(all.length, entries.length);
  assert.equal(new Set(all).size, entries.length);
  assert.equal(groupOf("/vans-for-sale/london"), "pages"); // not under /vans
  assert.equal(groupOf("/van-newsletter"), "pages");
  assert.equal(groupOf("/blog/x"), "blog");
  assert.equal(groupOf("/dealers"), "dealers");
  assert.equal(groupOf("/used-vans/body-type/luton-for-sale"), "used-vans");
});

test("the index lists each child with the newest real lastmod of its URLs, and omits it when none has one", () => {
  const dated = [{ url: `${B}/blog/a`, lastModified: "2026-10-01T00:00:00Z" }, { url: `${B}/blog/b`, lastModified: "2026-11-01T00:00:00Z" }, { url: `${B}/blog/c` }];
  assert.equal(newestLastmod(dated, NOW), "2026-11-01T00:00:00.000Z");
  assert.equal(newestLastmod([{ url: `${B}/dealers` }], NOW), undefined);
  const xml = sitemapIndexXml([{ loc: `${B}/sitemaps/blog.xml`, lastmod: newestLastmod(dated, NOW) }, { loc: `${B}/sitemaps/dealers.xml` }]);
  assert.equal((xml.match(/<sitemap>/g) ?? []).length, 2);
  assert.equal((xml.match(/<lastmod>/g) ?? []).length, 1);
});
