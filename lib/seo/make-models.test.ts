import { test } from "node:test";
import assert from "node:assert/strict";
import { makeBreadcrumbList, modelCardText, modelStockLabel, vehicleItemList } from "./make-models.ts";

const abs = (p: string) => `https://vansales.com${p}`;

test("a model with stock reads 'Name — N vans for sale'", () => {
  assert.equal(modelCardText("Volkswagen", "Transporter", 2), "Volkswagen Transporter — 2 vans for sale");
  assert.equal(modelCardText("Volkswagen", "Caddy", 1), "Volkswagen Caddy — 1 van for sale");
});

test("zero, null, undefined and NaN stock all read 'no stock right now'", () => {
  for (const c of [0, null, undefined, NaN, -1]) {
    assert.equal(modelCardText("Volkswagen", "Amarok", c), "Volkswagen Amarok — no stock right now");
  }
});

test("no model card text contains None, undefined, null or a digit glued to a letter", () => {
  const names = ["Transporter", "Amarok", "Caddy", "ID. Buzz Cargo", "T6.1", "e-Crafter"];
  for (const n of names) for (const c of [0, 1, 2, 12, 150, null, undefined, NaN]) {
    const t = modelCardText("Volkswagen", n, c);
    assert.doesNotMatch(t, /None in stock|None|undefined|null|NaN/, t);
    // the count is the only number we add: it must be followed by a space (the model name's own digits, e.g. T6.1, are not ours)
    assert.doesNotMatch(modelStockLabel(c), /\d[A-Za-z]/, t);
    assert.match(t, / — /, t);
  }
});

const van = { slug: "a", make: "Volkswagen", model: "Transporter", year: 2019, mileage: 54000, fuel: "Diesel", price: 17995, images: [{ url: "https://cdn.x/a.jpg", alt: "" }] };

test("Vehicle JSON-LD carries the fields and an InStock GBP offer", () => {
  const list = vehicleItemList([van], abs);
  const v = list.itemListElement[0].item as unknown as { "@type": string; url: string; image: string; brand: { name: string }; vehicleModelDate: string; mileageFromOdometer: { value: number }; fuelType: string; offers: { price: number; priceCurrency: string; availability: string } };
  assert.equal(v["@type"], "Vehicle");
  assert.equal(v.url, "https://vansales.com/listing/a");
  assert.equal(v.image, "https://cdn.x/a.jpg");
  assert.equal(v.brand.name, "Volkswagen");
  assert.equal(v.vehicleModelDate, "2019");
  assert.equal(v.mileageFromOdometer.value, 54000);
  assert.equal(v.fuelType, "Diesel");
  assert.deepEqual([v.offers.price, v.offers.priceCurrency, v.offers.availability], [17995, "GBP", "https://schema.org/InStock"]);
});

test("null or empty fields are omitted, never emitted as empty strings", () => {
  const list = vehicleItemList([{ ...van, mileage: null, fuel: "", price: null, images: [{ url: "van://panel", alt: "" }] }], abs);
  const v = list.itemListElement[0].item as Record<string, unknown>;
  for (const k of ["mileageFromOdometer", "fuelType", "offers", "image"]) assert.equal(k in v, false, k);
  assert.doesNotMatch(JSON.stringify(list), /""|null|undefined/);
});

test("breadcrumb is Home > Vans for sale > Make vans for sale", () => {
  const b = makeBreadcrumbList("Volkswagen", "/vans/volkswagen-vans-for-sale", abs);
  assert.deepEqual(b.itemListElement.map((i) => [i.position, i.name, i.item]), [
    [1, "Home", "https://vansales.com/"],
    [2, "Vans for sale", "https://vansales.com/vans"],
    [3, "Volkswagen vans for sale", "https://vansales.com/vans/volkswagen-vans-for-sale"],
  ]);
});
