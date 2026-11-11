import test from "node:test";
import assert from "node:assert/strict";
import { NEW_VANS_REDIRECTS } from "./new-vans.ts";

// next.config.ts sends /vans/{make} to /vans/{make}-vans-for-sale, so a /new-vans redirect that targets a bare /vans/{make} is a two-hop chain.
const CATEGORIES = new Set(["chassis-cab", "crew-van", "dropside", "electric", "luton", "minibus", "new", "panel-van", "pickup", "tipper", "ulez", "used"]);

test("no /new-vans redirect lands on a URL that redirects again", () => {
  for (const r of NEW_VANS_REDIRECTS) {
    const m = /^\/vans\/([a-z0-9-]+)$/.exec(r.destination);
    if (!m) continue;
    assert.ok(m[1].endsWith("-vans-for-sale") || CATEGORIES.has(m[1]), `${r.source} -> ${r.destination} is a two-hop chain`);
  }
});

test("no destination is itself a source", () => {
  const sources = new Set(NEW_VANS_REDIRECTS.map((r) => r.source));
  for (const r of NEW_VANS_REDIRECTS) assert.ok(!sources.has(r.destination), `${r.source} -> ${r.destination} chains`);
});

test("the three collapsed chains go straight to the final URL", () => {
  const d = (s: string) => NEW_VANS_REDIRECTS.find((r) => r.source === s)?.destination;
  assert.equal(d("/new-vans/mercedes-luton-van"), "/vans/mercedes-benz-vans-for-sale");
  assert.equal(d("/new-vans/vauxhall-combi-lease"), "/vans/vauxhall-vans-for-sale");
  assert.equal(d("/new-vans/vw-t7-camper-for-sale"), "/vans/volkswagen-vans-for-sale");
});
