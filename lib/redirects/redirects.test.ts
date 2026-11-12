import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildRedirects } from "./all.ts";

// Static checks run offline on every `npm test`. CHECK_LIVE=1 (optionally BASE_URL=...) additionally GETs every destination and asserts a plain 200.
const rules = buildRedirects();

/** next.config source pattern -> RegExp (path-to-regexp subset used in this repo: :name, :name(regex), :name*). Matching is case-insensitive like Next's. */
function sourceToRegExp(source: string): RegExp {
  let out = "";
  for (let i = 0; i < source.length; ) {
    if (source[i] === ":") {
      const m = /^:[A-Za-z_]\w*/.exec(source.slice(i))!;
      i += m[0].length;
      if (source[i] === "(") {
        let depth = 0;
        let j = i;
        do {
          if (source[j] === "\\") j++;
          else if (source[j] === "(") depth++;
          else if (source[j] === ")") depth--;
          j++;
        } while (depth > 0);
        out += source.slice(i, j);
        i = j;
      } else if (source[i] === "*") {
        out += ".*";
        i++;
      } else out += "[^/]+";
    } else {
      out += source[i].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      i++;
    }
  }
  return new RegExp(`^${out}/?$`, "i");
}

const matchers = rules.map((r) => ({ rule: r, re: sourceToRegExp(r.source) }));
const staticDestinations = [...new Set(rules.map((r) => r.destination).filter((d) => !d.includes(":")))];

/** The app's route tree (route groups removed) as a list of segment patterns, to prove a destination maps to a real route. */
function routes(): string[][] {
  const out: string[][] = [];
  (function walk(dir: string, segs: string[]) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    if (entries.some((e) => /^page\.(tsx|ts|jsx|js|mdx)$/.test(e.name))) out.push(segs);
    for (const e of entries) {
      if (!e.isDirectory() || e.name.startsWith("_") || e.name.startsWith("@")) continue;
      walk(path.join(dir, e.name), /^\(.*\)$/.test(e.name) ? segs : [...segs, e.name]);
    }
  })(path.join(process.cwd(), "app"), []);
  return out;
}
const ROUTES = routes();
const hasRoute = (p: string) => {
  const segs = p.split("?")[0].split("/").filter(Boolean);
  return ROUTES.some((r) => r.length === segs.length && r.every((s, i) => s === segs[i] || /^\[[^\]]+\]$/.test(s)));
};

test("sources are unique", () => {
  const seen = new Set<string>();
  for (const r of rules) {
    assert.ok(!seen.has(r.source), `duplicate redirect source ${r.source}`);
    seen.add(r.source);
  }
});

test("no self-redirects", () => {
  for (const r of rules) assert.notEqual(r.source, r.destination, `${r.source} redirects to itself`);
});

test("destinations are internal paths", () => {
  for (const r of rules) assert.match(r.destination, /^\/[^/]|^\/$/, `${r.source} -> ${r.destination} is not an internal path`);
});

test("no destination is itself redirected (no chains)", () => {
  for (const d of staticDestinations) {
    const p = d.split("?")[0];
    const hit = matchers.find((m) => m.re.test(p));
    assert.ok(!hit, `${d} is the destination of a redirect but is itself redirected by ${hit?.rule.source} -> ${hit?.rule.destination}`);
  }
});

test("every destination maps to a real app route", () => {
  for (const d of staticDestinations) assert.ok(hasRoute(d), `${d} matches no route under app/`);
});

test("backlink redirects are 301", async () => {
  const { BACKLINK_REDIRECTS } = await import("./backlinks.ts");
  for (const r of BACKLINK_REDIRECTS) assert.equal(r.statusCode, 301);
});

test("LIVE: every destination answers 200 without redirecting", { skip: process.env.CHECK_LIVE !== "1" }, async () => {
  const base = process.env.BASE_URL ?? "https://www.vansales.com";
  const bad: string[] = [];
  for (const d of staticDestinations) {
    const res = await fetch(base + d, { redirect: "manual", headers: { "user-agent": "Mozilla/5.0 (compatible; redirect-check)" } });
    if (res.status !== 200) bad.push(`${d} -> ${res.status}${res.headers.get("location") ? ` (location ${res.headers.get("location")})` : ""}`);
    await new Promise((r) => setTimeout(r, 150));
  }
  assert.deepEqual(bad, [], `destinations that are not a plain 200:\n${bad.join("\n")}`);
});
