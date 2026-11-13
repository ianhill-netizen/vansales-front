import { test } from "node:test";
import assert from "node:assert/strict";
import { BODY_TYPE_PAGES, bodyTypeDescription, bodyTypeH1, bodyTypeOldPath, bodyTypePath, bodyTypeTitle, findBodyType, findBodyTypeByParam, type BodyTypeListing } from "./body-types.ts";
import { findUsedVanModel } from "./models.ts";

const van = (o: Partial<BodyTypeListing> & { body?: string; wheelbase?: string | null; roof?: string | null } = {}): BodyTypeListing => ({
  make: o.make ?? "Ford", model: o.model ?? "Transit", derivative: o.derivative ?? "350 L3 H3", features: o.features,
  van_spec: { body_style: o.body ?? "Panel Van", wheelbase: o.wheelbase ?? null, roof_height: o.roof ?? null },
});

test("there are exactly the sixteen body types and five facet pages, with unique slugs and paths", () => {
  assert.deepEqual(BODY_TYPE_PAGES.map((b) => b.slug).sort(), ["4x4", "automatic-vans", "chassis-cab", "combi-vans", "crew-van", "curtain-side", "dropside", "high-roof", "large-vans", "long-wheelbase", "low-mileage", "luton", "minibus", "no-vat-vans", "panel-van", "pickup", "refrigerated", "small-vans", "tail-lift", "tipper", "wheelchair-accessible"]);
  assert.equal(new Set(BODY_TYPE_PAGES.map(bodyTypePath)).size, 21);
  assert.equal(bodyTypePath(findBodyType("luton")!), "/used-vans/body-type/luton-for-sale");
  assert.equal(bodyTypeOldPath(findBodyType("luton")!), "/used-vans/body-type/luton");
  assert.equal(findBodyTypeByParam("luton-for-sale")?.slug, "luton");
  assert.equal(findBodyTypeByParam("luton"), undefined);
  assert.equal(findBodyType("flatbed"), undefined);
});

test("every model a body type links to is a routable /used-vans model", () => {
  for (const b of BODY_TYPE_PAGES) for (const [make, model] of b.models) assert.ok(findUsedVanModel(make, model), `${b.slug}: ${make}/${model}`);
});

test("matching: body style, roof, wheelbase and text", () => {
  const m = (slug: string, l: BodyTypeListing) => findBodyType(slug)!.match(l);
  assert.ok(m("luton", van({ body: "Luton" })));
  assert.ok(!m("luton", van()));
  assert.ok(m("dropside", van({ body: "Dropside" })));
  assert.ok(m("tipper", van({ derivative: "350 Tipper" })));
  assert.ok(m("curtain-side", van({ body: "Curtain Side" })));
  assert.ok(m("refrigerated", van({ features: ["Fridge unit"] })));
  assert.ok(m("crew-van", van({ body: "Crew Cab" })));
  assert.ok(m("crew-van", van({ derivative: "DCIV" })));
  assert.ok(!m("crew-van", van()));
  assert.ok(m("high-roof", van({ roof: "high" })));
  assert.ok(!m("high-roof", van({ roof: "low" })));
  assert.ok(m("long-wheelbase", van({ wheelbase: "lwb" })));
  assert.ok(m("long-wheelbase", van({ wheelbase: "xlwb" })));
  assert.ok(!m("long-wheelbase", van({ wheelbase: "swb" })));
  assert.ok(m("4x4", van({ derivative: "2.0 4WD" })));
  assert.ok(m("4x4", van({ make: "Land Rover", model: "Defender", body: "Pickup" })));
  assert.ok(m("wheelchair-accessible", van({ derivative: "Wheelchair Accessible Vehicle" })));
});

test("H1, title and description patterns, and the two new matchers", () => {
  const b = findBodyType("wheelchair-accessible")!;
  assert.equal(bodyTypeH1(b), "Used Wheelchair Accessible Vans For Sale");
  assert.equal(bodyTypeH1(findBodyType("4x4")!), "Used 4x4 Vans For Sale");
  assert.equal(bodyTypeTitle(findBodyType("tail-lift")!), "Used Tail Lift Vans For Sale | Vansales.com");
  assert.equal(bodyTypeDescription(findBodyType("luton")!), "Browse used Luton vans for sale from verified UK dealers. Compare prices, specs and mileage. No nonsense, straight-talking marketplace.");
  for (const d of BODY_TYPE_PAGES) assert.ok(bodyTypeDescription(d).length <= 165, d.slug);
  assert.ok(findBodyType("tail-lift")!.match(van({ derivative: "Tail-Lift 350" })));
  assert.ok(findBodyType("tail-lift")!.match(van({ features: ["Tail lift"] })));
  assert.ok(!findBodyType("tail-lift")!.match(van()));
  assert.ok(findBodyType("low-mileage")!.match({ ...van(), mileage: 12000 }));
  assert.ok(!findBodyType("low-mileage")!.match({ ...van(), mileage: 80000 }));
  assert.ok(!findBodyType("low-mileage")!.match(van()));
});
