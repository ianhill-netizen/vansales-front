import test from "node:test";
import assert from "node:assert/strict";
import { demoteH1, countH1 } from "./headings.ts";
import { mdToHtml } from "./markdown.ts";

test("an h1 in a body becomes an h2 and keeps its classes", () => {
  const out = demoteH1('<h1 class="mt-4 font-bold">Title</h1><p>x</p><h2>Sub</h2>');
  assert.equal(out, '<h2 class="mt-4 font-bold">Title</h2><p>x</p><h2>Sub</h2>');
  assert.equal(countH1(out), 0);
});

test("a markdown post that starts with '# Title' no longer renders an h1 once demoted", () => {
  const html = mdToHtml("# Duplicate of the page title\n\nBody.\n\n## Section\n\nMore.");
  assert.equal(countH1(html), 1);
  assert.equal(countH1(demoteH1(html)), 0);
});

test("html without an h1 is untouched", () => {
  const h = "<p>no heading</p><h2>a</h2><h3>b</h3>";
  assert.equal(demoteH1(h), h);
});
