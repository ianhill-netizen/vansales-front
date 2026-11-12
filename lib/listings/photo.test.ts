import { test } from "node:test";
import assert from "node:assert/strict";
import { hasCardPhoto, withoutPlaceholderImages } from "./photo.ts";

const img = (url: string) => ({ url, alt: "x" });

test("a listing with an http(s) first image has a card photo", () => {
  assert.equal(hasCardPhoto({ images: [img("https://cdn.example/a.jpg")] }), true);
  assert.equal(hasCardPhoto({ images: [img("http://cdn.example/a.jpg"), img("")] }), true);
});

test("no images, or a first image that is not a URL, means no card", () => {
  assert.equal(hasCardPhoto({ images: [] }), false);
  assert.equal(hasCardPhoto({ images: [img("")] }), false);
  assert.equal(hasCardPhoto({ images: [img("/placeholder.png")] }), false);
  assert.equal(hasCardPhoto({ images: undefined as never }), false);
});

test("a placeholder-looking lead image is not a card photo, whatever its status code would be", () => {
  assert.equal(hasCardPhoto({ images: [img("https://vansales.com/images/new-vans/woocommerce-placeholder-600x600.png.webp")] }), false);
  assert.equal(hasCardPhoto({ images: [img("https://cdn.example/No-Image.jpg?v=2")] }), false);
  assert.equal(hasCardPhoto({ images: [img("https://cdn.example/coming-soon.png")] }), false);
  assert.equal(hasCardPhoto({ images: [img("https://cdn.example/van.jpg?ref=placeholder")] }), true, "the query string is not the picture");
});

test("a placeholder first image is removed so the first real photo behind it leads", () => {
  const out = withoutPlaceholderImages([img("https://x/woocommerce-placeholder.webp"), img("https://x/real-1.jpg"), img("https://x/real-2.jpg")]);
  assert.deepEqual(out.map((i) => i.url), ["https://x/real-1.jpg", "https://x/real-2.jpg"]);
  assert.equal(hasCardPhoto({ images: out }), true);
  assert.equal(hasCardPhoto({ images: withoutPlaceholderImages([img("https://x/woocommerce-placeholder.webp")]) }), false);
});
