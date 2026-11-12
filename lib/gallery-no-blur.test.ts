import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Vehicle photos are never masked, blurred or redacted automatically (Ian, 2026-11-12). The old fixed-position PlateBlur overlay landed on the grille of cropped photos. It stays in
// components/gallery.tsx only as a dead, documented function; this guard fails if anything renders it or puts a blur overlay back.
const src = readFileSync(new URL("../components/gallery.tsx", import.meta.url), "utf8");
const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

test("the gallery never renders PlateBlur", () => {
  assert.ok(!/<PlateBlur\b/.test(code), "a <PlateBlur /> element is back in components/gallery.tsx");
});

test("the gallery has no plate-blur overlay element or test id", () => {
  assert.ok(!/plate-blur/.test(code), "data-testid=plate-blur found in components/gallery.tsx");
  // an overlay span positioned over the photo with a blur filter (the old shape): absolute + percentage box + backdrop-blur on the same element
  assert.ok(!/<span[^>]*(h-\[\d+%\]|w-\[\d+%\])[^>]*backdrop-blur[^>]*>/.test(code), "a percentage-sized backdrop-blur overlay is back in components/gallery.tsx");
});

test("PlateBlur, if it still exists, renders nothing", () => {
  const m = code.match(/function PlateBlur\(\)[^{]*\{([\s\S]*?)\n\}/);
  if (m) assert.match(m[1], /return null;/);
});
