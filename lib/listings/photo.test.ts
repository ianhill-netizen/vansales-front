import { test } from "node:test";
import assert from "node:assert/strict";
import { hasCardPhoto } from "./photo.ts";

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
