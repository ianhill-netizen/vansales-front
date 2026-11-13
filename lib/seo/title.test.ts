import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { fitTitle, stripBrand } from "./title.ts";

const SUFFIX = " · Vansales";

test("a title that fits is returned unchanged", () => {
  assert.equal(fitTitle("Ford Transit Sizes: Your Complete Guide", SUFFIX), "Ford Transit Sizes: Your Complete Guide");
});

test("never cuts mid-word and leaves no dangling punctuation", () => {
  const t = fitTitle("Tax Implications of Owning a Land Rover Defender Commercial: What Every Business Owner Must Know", SUFFIX);
  assert.equal(t, "Tax Implications of Owning a Land Rover Defender");
  const u = fitTitle("How to Change Headlight Bulb on Citroen Berlingo Van: A Complete Guide", SUFFIX);
  assert.ok("How to Change Headlight Bulb on Citroen Berlingo Van: A Complete Guide".startsWith(u));
  assert.ok(u.length + SUFFIX.length <= 60);
  assert.equal(u, "How to Change Headlight Bulb on Citroen Berlingo");
});

test("the suffix counts against the limit", () => {
  const long = "word ".repeat(30).trim();
  assert.ok(fitTitle(long, SUFFIX).length + SUFFIX.length <= 60);
  assert.ok(fitTitle(long, "").length <= 60);
});

test("a single over-long word is kept whole", () => {
  assert.equal(fitTitle("Supercalifragilisticexpialidocious".repeat(4), SUFFIX), "Supercalifragilisticexpialidocious".repeat(4));
});

test("a brand the title already carries is removed (the layout adds it once)", () => {
  assert.equal(stripBrand("Used Van HPI Check Guide | vansales.com"), "Used Van HPI Check Guide");
  assert.equal(stripBrand("Best Used Pickup Trucks UK: Top 5 Reliable Picks | Vansales."), "Best Used Pickup Trucks UK: Top 5 Reliable Picks");
  assert.equal(stripBrand("Van Finance Options Explained | vansales.com UK Guide"), "Van Finance Options Explained | UK Guide");
  assert.equal(stripBrand("Used Van MOT History Guide: Red Flags & Checks | vansales.co"), "Used Van MOT History Guide: Red Flags & Checks");
  assert.equal(stripBrand("Why Vansales Exists"), "Why Vansales Exists");   // only a brand after a separator is a suffix
  assert.equal(fitTitle("Used Tipper Van Buying Guide | Vansales.com", SUFFIX), "Used Tipper Van Buying Guide");
});

// Real offending meta titles from the live backend guide rows (api.vansales.com /api/public/content/pages), crawled 2026-11-12.
const REAL: Array<[string, string]> = [
  ["Used Citroen Dispatch: What to Check Before You B | Van", "Used Citroen Dispatch: What to Check"],
  ["Used Volkswagen Amarok: What to Check Before You | Van Sale", "Used Volkswagen Amarok: What to Check"],
  ["Used Ford Transit: What to Check Before You Buy | Van Sales", "Used Ford Transit: What to Check Before You Buy"],
  ["When Is the Best Time to Sell a Van? | Van Sales", "When Is the Best Time to Sell a Van?"],
  ["Selling a Van With Outstanding Finance | Van Sales", "Selling a Van With Outstanding Finance"],
  ["Used Minibus Buying Guide UK | Practical Advice | Van Sales", "Used Minibus Buying Guide UK | Practical Advice"],
];

test("real offending titles: brand variants and a cut brand are removed, one brand only", () => {
  for (const [input, want] of REAL) {
    const out = fitTitle(input, SUFFIX);
    assert.equal(out, want, input);
    assert.ok(out.length + SUFFIX.length <= 60, input);
    assert.ok(!/van\s?sales\s*$|vansales/i.test(out), `brand left in: ${out}`);
  }
});

test("brand variants are stripped whatever the separator", () => {
  for (const t of ["Foo Bar | Van Sales", "Foo Bar | Vansales", "Foo Bar - Van Sales", "Foo Bar \u00b7 Vansales", "Foo Bar \u2013 Vansales.com"]) assert.equal(stripBrand(t), "Foo Bar", t);
});

test("a long topic is cut at a word boundary and never ends on a dangling word", () => {
  for (const t of [
    "2024 Renault Kangoo Dimensions and Specs: What You Need to Know",
    "Roof Height Options for Ford Transit Custom: Which One Is Best for You",
    "Top Tips for a Smooth Journey: Taking Your Van on the Eurotunnel",
    "Auto China Van KUBIK7 2026: Budget Chinese electric workhorse lands in Europe with \u20ac26,900 price tag",
  ]) {
    const out = fitTitle(t, SUFFIX);
    assert.ok(out.length + SUFFIX.length <= 60, out);
    assert.ok(t.startsWith(out), `${out} is not a whole-word prefix of ${t}`);
    assert.ok(t[out.length] === " " || t[out.length] === ":" || t.length === out.length, `mid-word cut: ${out}`);
    assert.ok(!/\s(a|an|the|of|to|for|and|you|what|which|one)$/i.test(out), out);
  }
});

test("sweep: every markdown post title fits, is whole-word, has no double brand", () => {
  const dir = new URL("../../content/blog/", import.meta.url);
  const files = readdirSync(dir).filter((f) => f.endsWith(".md"));
  assert.ok(files.length > 20);
  for (const f of files) {
    const m = readFileSync(new URL(f, dir), "utf8").match(/^title:\s*(.+)$/m);
    assert.ok(m, `${f} has no title`);
    const title = m![1].trim().replace(/^["']|["']$/g, "");
    const out = fitTitle(title, SUFFIX);
    const rendered = `${out}${SUFFIX}`;
    assert.ok(rendered.length <= 60 || !out.includes(" "), `${f}: ${rendered}`);
    assert.equal((rendered.match(/vansales/gi) ?? []).length, 1, `${f}: ${rendered}`);
    const t = stripBrand(title.replace(/\s+/g, " "));
    assert.ok(t.startsWith(out), `${f}: ${out}`);
    assert.ok(t.length === out.length || /[\s:;,\-\u2013\u2014|&/(]/.test(t[out.length]), `${f}: cut mid-word: ${out}`);
  }
});

test("a long listing title fits 60 characters in total with the layout's ' · Vansales' suffix", () => {
  const suffix = " · Vansales";
  for (const t of [
    "Volkswagen Transporter Kombi SWB 150 DSG T32 Highline TDI Semi-Auto (2024)",
    "Land Rover Defender Hard Top X-Dynamic HSE D MHEV Automatic (2026)",
    "Ford Transit Custom Double Cab-in-Van 320 Limited EcoBlue (2021)",
    "Rhys huish commercials limited — Van Dealer in Bridgend",
  ]) {
    const out = fitTitle(t, suffix);
    assert.ok([...(out + suffix)].length <= 60, `${out}${suffix}`);
    assert.ok(out.length > 20, out);
  }
});
