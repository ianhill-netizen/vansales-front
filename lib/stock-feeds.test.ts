import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FEED_GROUPS, HOME_CARD_PLATFORMS, NEXT_STEPS, STOCK_FEEDS_DESCRIPTION, STOCK_FEEDS_H1, STOCK_FEEDS_LASTMOD, STOCK_FEEDS_PATH, STOCK_FEEDS_REQUESTED_TITLE, STOCK_FEEDS_TITLE } from "./stock-feeds.ts";
import { TITLE_TOTAL_MAX, fitTitle } from "./seo/title.ts";
import { groupOf, urlsetXml } from "./sitemap/xml.ts";

// No quality gate covers this page: the backend ContentGate / MarkdownPostScanner scan database guide rows and markdown posts, not code-rendered pages. These checks stand in for it.
const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const PAGE = read("app/(main)/stock-feeds/page.tsx");
const DATA = read("lib/stock-feeds.ts");
const SUFFIX = " · Vansales";

// The text a visitor reads: page copy plus the data module's string literals, with comments removed (TODO(Ian) comments live in the source, never on the page).
const rendered = [
  PAGE.replace(/\/\/.*$/gm, ""),
  STOCK_FEEDS_H1, STOCK_FEEDS_TITLE, STOCK_FEEDS_DESCRIPTION,
  ...FEED_GROUPS.flatMap((g) => [g.title, ...g.sources.flatMap((s) => [s.name, s.note])]),
  ...NEXT_STEPS.flatMap((s) => [s.title, s.body]),
].join("\n");

test("exactly one h1, with the requested text", () => {
  assert.equal((PAGE.match(/<h1[\s>]/g) ?? []).length, 1);
  assert.equal(STOCK_FEEDS_H1, "Import your stock from the platform you already use");
  assert.ok(PAGE.includes("{STOCK_FEEDS_H1}"));
});

test("title goes through the site helper and fits 60 characters with the single brand suffix", () => {
  assert.equal(STOCK_FEEDS_TITLE, fitTitle(STOCK_FEEDS_REQUESTED_TITLE, SUFFIX));
  assert.ok((STOCK_FEEDS_TITLE + SUFFIX).length <= TITLE_TOTAL_MAX);
  assert.ok(STOCK_FEEDS_TITLE.startsWith("Van Dealer Stock Feeds"));
  assert.ok(!/vansales/i.test(STOCK_FEEDS_TITLE));
});

test("meta description present and at most 160 characters", () => {
  assert.ok(STOCK_FEEDS_DESCRIPTION.length > 50 && STOCK_FEEDS_DESCRIPTION.length <= 160, String(STOCK_FEEDS_DESCRIPTION.length));
});

test("canonical is https://vansales.com/stock-feeds through absUrl, and the page is indexable", () => {
  assert.equal(STOCK_FEEDS_PATH, "/stock-feeds");
  assert.ok(PAGE.includes("canonical: absUrl(STOCK_FEEDS_PATH)"));
  assert.ok(!/robots|noindex/i.test(PAGE));
});

test("in the pages child sitemap with a real lastmod", () => {
  assert.equal(groupOf(STOCK_FEEDS_PATH), "pages");
  assert.match(STOCK_FEEDS_LASTMOD, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(Date.parse(STOCK_FEEDS_LASTMOD) <= Date.now());
  assert.ok(read("lib/sitemap/build.ts").includes("e(STOCK_FEEDS_PATH, STOCK_FEEDS_LASTMOD)"));
  const xml = urlsetXml([{ url: `https://vansales.com${STOCK_FEEDS_PATH}`, lastModified: STOCK_FEEDS_LASTMOD }]);
  assert.ok(xml.includes(`<loc>https://vansales.com/stock-feeds</loc><lastmod>${STOCK_FEEDS_LASTMOD}`));
});

test("linked from the home For dealers card, the footer and /advertise, and the Advertise link is kept", () => {
  const home = read("components/home/why-vansales.tsx");
  assert.ok(home.includes('href: "/stock-feeds"'));
  assert.ok(home.includes('link: "Advertise with us"') && home.includes('href: "/advertise"'));
  assert.ok(read("components/footer.tsx").includes('href: "/stock-feeds"'));
  assert.ok(read("app/(main)/advertise/page.tsx").includes('href="/stock-feeds"'));
  assert.ok(PAGE.includes('href="/advertise"'));
});

test("every platform in the home card copy appears on the page, and the card carries Ian's copy", () => {
  const home = read("components/home/why-vansales.tsx");
  assert.ok(home.includes("Send us your existing feed — AutoTrader, eBay Motors, Pinewood, Dragon2000, Click Dealer, GForces or a CSV — and we do the rest. No re-keying."));
  for (const name of HOME_CARD_PLATFORMS) {
    assert.ok(rendered.includes(name), name);
    assert.ok(home.includes(name), name);
  }
});

test("all the requested sources are listed", () => {
  const names = FEED_GROUPS.flatMap((g) => g.sources.map((s) => s.name));
  for (const n of ["AutoTrader", "CarGurus", "Carwow", "Facebook Marketplace", "Pinewood", "Keyloop (CDK)", "Dragon2000", "Dealerweb", "Click Dealer", "Evolution Funding", "GForces NetDirector", "Autoweb Design", "Spidersnet", "Bluesky Interactive", "CSV upload", "XML feed", "AutoTrader Connect API"]) assert.ok(names.includes(n), n);
  assert.ok(names.some((n) => n.startsWith("eBay Motors Group")));
  assert.deepEqual(FEED_GROUPS.map((g) => g.title), ["Marketplaces", "DMS and stock management", "Website platforms", "Direct"]);
});

test("no TODO leaks into the rendered text; TODO(Ian) comments stay in the source", () => {
  assert.ok(!/TODO/i.test(rendered));
  assert.ok(/TODO\(Ian\)/.test(DATA));
});

test("no numeric timing claims, and no integration claims", () => {
  assert.ok(!/within \d+|\d+\s*(hours?|days?|minutes?|mins?|weeks?)|every \d+/i.test(rendered));
  assert.ok(!/integrat|official partner|certified/i.test(rendered));
});
