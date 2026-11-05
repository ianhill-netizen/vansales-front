import { test } from "node:test";
import assert from "node:assert/strict";
import { safeHref, safeImageUrl, sanitizeGuideHtml } from "./sanitize.ts";

test("scripts, styles, iframes and their contents are dropped", () => {
  const out = sanitizeGuideHtml('<p>Hi</p><script>alert(1)</script><style>p{}</style><iframe src="x">inner</iframe><p>Bye</p>');
  assert.equal(out, "<p>Hi</p><p>Bye</p>");
});

test("event handlers and unknown attributes never survive", () => {
  assert.equal(sanitizeGuideHtml('<p onclick="x()" style="a:b" class="c">T</p>'), "<p>T</p>");
  assert.ok(!sanitizeGuideHtml('<a href="/x" onmouseover="y()">l</a>').includes("onmouseover"));
});

test("javascript:, data: and protocol-relative links are refused; relative and https are kept", () => {
  assert.equal(safeHref("javascript:alert(1)"), null);
  assert.equal(safeHref("  JaVa\nScript:alert(1)"), null);
  assert.equal(safeHref("data:text/html,x"), null);
  assert.equal(safeHref("//evil.example/x"), null);
  assert.equal(safeHref("/vans/ford"), "/vans/ford");
  assert.equal(safeHref("https://example.com/a"), "https://example.com/a");
  const out = sanitizeGuideHtml('<a href="javascript:alert(1)">x</a>');
  assert.ok(!out.includes("javascript"));
});

test("external links get rel and target; internal ones do not", () => {
  assert.match(sanitizeGuideHtml('<a href="https://example.com">e</a>'), /rel="nofollow noopener noreferrer"/);
  assert.ok(!sanitizeGuideHtml('<a href="/vans/ford">i</a>').includes("rel="));
});

test("images in the body are dropped (pictures come from the images list) and stray < is escaped", () => {
  assert.equal(sanitizeGuideHtml('<p>a <img src="https://x/y.png" onerror="z"> b</p>'), "<p>a  b</p>");
  assert.equal(sanitizeGuideHtml("<p>1 < 2</p>"), "<p>1 &lt; 2</p>");
});

test("unclosed tags are balanced", () => {
  assert.equal(sanitizeGuideHtml("<ul><li>one<li>two"), "<ul><li>one<li>two</li></li></ul>");
});

test("only https image URLs are accepted", () => {
  assert.equal(safeImageUrl("http://x/y.png"), null);
  assert.equal(safeImageUrl("javascript:alert(1)"), null);
  assert.equal(safeImageUrl('https://x/y.png"onerror="z'), null);
  assert.equal(safeImageUrl("https://cdn.example/y.png"), "https://cdn.example/y.png");
});
