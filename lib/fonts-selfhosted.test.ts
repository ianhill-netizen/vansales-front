import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

// Fonts are self-hosted (app/fonts.ts via next/font/local). No source file may depend on Google Fonts at build or run time.
const FORBIDDEN = [/fonts\.googleapis\.com/, /fonts\.gstatic\.com/, /next\/font\/google/];

test("no source file references Google Fonts", () => {
  const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
    .split("\0")
    .filter((f) => /\.(tsx?|jsx?|mjs|cjs|css|json|html|mdx?)$/.test(f))
    .filter((f) => !/^(package-lock\.json|tsconfig\.tsbuildinfo|content\/|lib\/fonts-selfhosted\.test\.ts)/.test(f));
  const hits: string[] = [];
  for (const f of files) {
    let text: string;
    try { text = readFileSync(f, "utf8"); } catch { continue; }
    for (const re of FORBIDDEN) if (re.test(text)) hits.push(`${f}: ${re}`);
  }
  assert.deepEqual(hits, []);
});
