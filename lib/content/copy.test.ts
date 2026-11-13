import { test } from "node:test";
import assert from "node:assert/strict";
import { copyWords, type Section } from "./copy.ts";
import { WARRANTY_FAQ, WARRANTY_INTRO, WARRANTY_SECTIONS } from "./van-warranty.ts";
import { BREAKDOWN_INTRO, BREAKDOWN_SECTIONS } from "./van-breakdown.ts";

const all = (intro: string[], sections: Section[]) => copyWords([{ id: "intro", h2: "", blocks: intro.map((p) => ({ p })) }, ...sections]);
const strip = (t: string) => t.replace(/Vansales does not sell, arrange or recommend [^.]*\./g, "");
const text = (intro: string[], sections: Section[]) => [...intro, ...sections.flatMap((s) => [s.h2, ...s.blocks.flatMap((b) => ("h3" in b ? [b.h3] : "p" in b ? [b.p] : b.ul))])].join("\n");
const PROVIDERS = /\b(AA|RAC|Green Flag|Warrantywise|Autoguard|Mapfre|Allianz|Axa|Aviva|Admiral|Direct Line|RIAC|Start Rescue|Europ Assistance)\b/;

test("van warranty page: 1,200-1,500 words of main content", () => {
  const n = all(WARRANTY_INTRO, WARRANTY_SECTIONS);
  assert.ok(n >= 1200 && n <= 1500, `warranty words: ${n}`);
});

test("van breakdown page: 1,000-1,200 words of main content", () => {
  const n = all(BREAKDOWN_INTRO, BREAKDOWN_SECTIONS);
  assert.ok(n >= 1000 && n <= 1200, `breakdown words: ${n}`);
});

test("no provider recommendations, no prices, no affiliate-style language on either page", () => {
  for (const [name, t] of [["warranty", text(WARRANTY_INTRO, WARRANTY_SECTIONS) + WARRANTY_FAQ.map((f) => f.q + f.a).join("\n")], ["breakdown", text(BREAKDOWN_INTRO, BREAKDOWN_SECTIONS)]] as const) {
    assert.doesNotMatch(t, PROVIDERS, `${name}: provider name`);
    assert.doesNotMatch(t, /[£$€]|\d+\s?(pounds|per cent|%)/i, `${name}: a price or percentage`);
    assert.doesNotMatch(strip(t), /\b(best|cheapest|guaranteed|recommend(ed)?|sponsored|affiliate|get a quote)\b/i, `${name}: promotional wording`);
    assert.doesNotMatch(t, /None|undefined|\bnull\b|TBC/, `${name}: placeholder`);
  }
});

test("the warranty page has the five model sections with a link to each model page, and six FAQs", () => {
  const models = WARRANTY_SECTIONS.find((s) => s.id === "models")!;
  const h3 = models.blocks.filter((b): b is { h3: string } => "h3" in b).map((b) => b.h3);
  assert.deepEqual(h3, ["Ford Transit", "Ford Transit Custom", "Volkswagen Transporter", "Mercedes-Benz Sprinter", "Vauxhall Vivaro"]);
  const links = [...text([], [models]).matchAll(/\]\((\/used-vans\/[^)]+)\)/g)].map((m) => m[1]);
  assert.deepEqual(links, ["/used-vans/ford/transit-for-sale", "/used-vans/ford/transit-custom-for-sale", "/used-vans/volkswagen/transporter-for-sale", "/used-vans/mercedes-benz/sprinter-for-sale", "/used-vans/vauxhall/vivaro-for-sale"]);
  assert.equal(WARRANTY_FAQ.length, 6);
});
