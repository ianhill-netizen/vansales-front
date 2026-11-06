import { test } from "node:test";
import assert from "node:assert/strict";
import { AUTO_LINK_MARK, autoLink } from "./auto-link.ts";

const links = (html: string) => [...html.matchAll(/<a href="([^"]+)" data-auto-link="1">([^<]+)<\/a>/g)].map((m) => [m[1], m[2]]);

test("first mention of a make and of a model each become one link, later mentions stay plain", () => {
  const out = autoLink("<p>The Ford Transit is popular. A Ford Transit holds value.</p>");
  assert.deepEqual(links(out).sort(), [["/used-vans/ford/transit-for-sale", "Transit"], ["/vans/ford-vans-for-sale", "Ford"]].sort());
  assert.equal(out.split(AUTO_LINK_MARK).length - 1, 2);
});

test("VW, Citroën and Mercedes-Benz map to their make pages; the longest model name wins", () => {
  const out = autoLink("<p>A VW Transporter, a Citroën Berlingo and a Mercedes-Benz Sprinter. The Ford Transit Custom beats the Ford Transit.</p>");
  const l = links(out);
  assert.ok(l.some(([h, t]) => h === "/vans/volkswagen-vans-for-sale" && t === "VW"));
  assert.ok(l.some(([h, t]) => h === "/used-vans/volkswagen/transporter-for-sale" && t === "Transporter"));
  assert.ok(l.some(([h, t]) => h === "/vans/citroen-vans-for-sale" && t === "Citroën"));
  assert.ok(l.some(([h, t]) => h === "/vans/mercedes-benz-vans-for-sale" && t === "Mercedes-Benz"));
  assert.ok(l.some(([h, t]) => h === "/used-vans/ford/transit-custom-for-sale" && t === "Transit Custom"));
  assert.ok(l.some(([h]) => h === "/used-vans/ford/transit-for-sale"), "plain Transit is its own first mention after Transit Custom");
});

test("nothing inside an existing link, a heading, code, or an attribute is touched", () => {
  const html = '<h2>Ford Transit review</h2><p><a href="/x">Ford Transit</a> <img alt="Ford Transit" src="/a.png"> <code>Ford</code></p><p>Plain Ford here.</p>';
  const out = autoLink(html);
  assert.equal(out.replace(/<a href="\/vans\/ford-vans-for-sale" data-auto-link="1">Ford<\/a>/, "Ford"), html.replace("Plain Ford here.", "Plain Ford here."));
  assert.deepEqual(links(out).map((l) => l[1]), ["Ford"]);
  assert.ok(out.includes('<h2>Ford Transit review</h2>') && out.includes('alt="Ford Transit"') && out.includes("<code>Ford</code>"));
});

test("ambiguous model names link only straight after their make", () => {
  assert.deepEqual(links(autoLink("<p>The master plan and the daily commute need an expert.</p>")), []);
  const out = autoLink("<p>A Renault Master or an Iveco Daily.</p>");
  assert.ok(links(out).some(([h, t]) => h === "/used-vans/renault/master-for-sale" && t === "Master"));
  assert.ok(links(out).some(([h, t]) => h === "/used-vans/iveco/daily-for-sale" && t === "Daily"));
});

test("no partial-word matches, and linking is idempotent and skips an excluded page", () => {
  assert.deepEqual(links(autoLink("<p>Fordable and Fiatlux and Transporters.</p>")), []);
  const once = autoLink("<p>Toyota Hilux.</p>");
  assert.equal(autoLink(once), once);
  assert.ok(!autoLink("<p>Toyota Hilux.</p>", ["/used-vans/toyota/hilux-for-sale"]).includes("hilux-for-sale"));
});
