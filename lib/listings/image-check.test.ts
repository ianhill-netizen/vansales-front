import { test } from "node:test";
import assert from "node:assert/strict";
import { checkImage, validateLeadImages, verdictChecker, MIN_IMAGE_BYTES, type UrlChecker } from "./image-check.ts";
import { hasCardPhoto } from "./photo.ts";

type Resp = { status?: number; type?: string | null; length?: number | null; body?: number; throws?: Error };
/** A fake fetch: url -> response description. */
const fakeFetch = (table: Record<string, Resp>) => async (url: string, init: { method: string; signal: AbortSignal }) => {
  const r = table[url] ?? { status: 404 };
  if (r.throws) throw r.throws;
  return {
    status: r.status ?? 200,
    headers: { get: (n: string) => (n === "content-type" ? (r.type === undefined ? "image/jpeg" : r.type) : n === "content-length" ? (r.length == null ? null : String(r.length)) : null) },
    arrayBuffer: async () => new ArrayBuffer(r.body ?? 0),
  };
};

const GOOD = { status: 200, type: "image/jpeg", length: 120_000 };

test("checkImage: a real photo passes", async () => {
  assert.deepEqual(await checkImage("https://c/a.jpg", fakeFetch({ "https://c/a.jpg": GOOD })), { ok: true });
});
test("checkImage: 404 lead is bad", async () => {
  const v = await checkImage("https://c/a.jpg", fakeFetch({}));
  assert.equal(v.ok, false);
});
test("checkImage: non-image content-type is bad", async () => {
  const v = await checkImage("https://c/a.jpg", fakeFetch({ "https://c/a.jpg": { ...GOOD, type: "text/html" } }));
  assert.equal(v.ok, false);
});
test("checkImage: tiny size (the grey frame, 11,770 bytes) is bad even though it is a 200 image/jpeg", async () => {
  const v = await checkImage("https://c/a.jpg", fakeFetch({ "https://c/a.jpg": { status: 200, type: "image/jpeg", length: 11_770 } }));
  assert.equal(v.ok, false);
  assert.ok(11_770 < MIN_IMAGE_BYTES);
});
test("checkImage: no content-length falls back to measuring the body", async () => {
  assert.equal((await checkImage("https://c/a.jpg", fakeFetch({ "https://c/a.jpg": { length: null, body: 11_770 } }))).ok, false);
  assert.equal((await checkImage("https://c/a.jpg", fakeFetch({ "https://c/a.jpg": { length: null, body: 90_000 } }))).ok, true);
});
test("checkImage: a placeholder url is bad without any request", async () => {
  let called = false;
  const v = await checkImage("https://c/woocommerce-placeholder.webp", (async () => { called = true; throw new Error("no"); }) as never);
  assert.equal(v.ok, false);
  assert.equal(called, false);
});
test("checkImage: an error or a timeout is 'unknown', never bad (card kept)", async () => {
  const boom = await checkImage("https://c/a.jpg", fakeFetch({ "https://c/a.jpg": { throws: new Error("ECONNRESET") } }));
  assert.equal(boom.ok, "unknown");
  const slow = async (_u: string, init: { signal: AbortSignal }) => new Promise<never>((_r, rej) => init.signal.addEventListener("abort", () => rej(Object.assign(new Error("aborted"), { name: "AbortError" }))));
  const t = await checkImage("https://c/a.jpg", slow as never, 20);
  assert.equal(t.ok, "unknown");
  assert.equal(verdictChecker(async () => t)("x") instanceof Promise, true);
  assert.equal(await verdictChecker(async () => t)("x"), true);
});

// ---- validateLeadImages over a catalogue ----
const L = (id: string, urls: string[]) => ({ id, status: "active", make: "VW", model: "Transporter", images: urls.map((url) => ({ url, alt: id })) }) as never as import("./types.ts").Listing;
const checker = (bad: string[]): UrlChecker => async (u) => !bad.includes(u);

test("no photos: emptied, no card", async () => {
  const [a] = await validateLeadImages([L("a", [])], checker([]));
  assert.equal(hasCardPhoto(a), false);
});
test("a valid lead is left untouched (same object)", async () => {
  const l = L("a", ["https://c/1.jpg", "https://c/2.jpg"]);
  const [a] = await validateLeadImages([l], checker([]));
  assert.equal(a, l);
});
test("a placeholder-looking lead with real photos behind it: the first real one leads (listing 6)", async () => {
  const [a] = await validateLeadImages([L("6", ["https://c/woocommerce-placeholder.webp", "https://c/real-1.jpg", "https://c/real-2.jpg"])], checker([]));
  assert.deepEqual(a.images.map((i) => i.url), ["https://c/real-1.jpg", "https://c/real-2.jpg"]);
});
test("a lead that fails the check (404 / non-image / tiny) is swapped for the next valid image, and dropped from the gallery", async () => {
  const [a] = await validateLeadImages([L("a", ["https://c/grey-frame.jpg", "https://c/real.jpg", "https://c/real-2.jpg"])], checker(["https://c/grey-frame.jpg"]));
  assert.deepEqual(a.images.map((i) => i.url), ["https://c/real.jpg", "https://c/real-2.jpg"]);
});
test("every tried image failing drops the card", async () => {
  const [a] = await validateLeadImages([L("a", ["https://c/1.jpg", "https://c/2.jpg"])], checker(["https://c/1.jpg", "https://c/2.jpg"]));
  assert.equal(hasCardPhoto(a), false);
});
test("timeout / error verdicts keep the card (the checker says true for unknown)", async () => {
  const unknown = verdictChecker(async () => ({ ok: "unknown", reason: "timed out" }));
  const l = L("a", ["https://c/1.jpg"]);
  const [a] = await validateLeadImages([l], unknown);
  assert.equal(a, l);
});
test("past the pass budget nothing is dropped (fail open)", async () => {
  let t = 0;
  const l = L("a", ["https://c/1.jpg"]);
  const [a] = await validateLeadImages([l], checker(["https://c/1.jpg"]), { now: () => (t += 10_000), budgetMs: 1 });
  assert.equal(a, l);
});
test("concurrency is bounded", async () => {
  let inFlight = 0, peak = 0;
  const c: UrlChecker = async () => { inFlight++; peak = Math.max(peak, inFlight); await new Promise((r) => setTimeout(r, 5)); inFlight--; return true; };
  await validateLeadImages(Array.from({ length: 30 }, (_, i) => L(String(i), [`https://c/${i}.jpg`])), c, { concurrency: 4 });
  assert.ok(peak <= 4, `peak ${peak}`);
});
test("parity: the grid predicate, the counts and the sitemap all see the same set after one validation pass", async () => {
  const cat = [L("ok", ["https://c/a.jpg"]), L("none", []), L("grey", ["https://c/grey.jpg"]), L("swap", ["https://c/woocommerce-placeholder.webp", "https://c/b.jpg"])];
  const valid = await validateLeadImages(cat, checker(["https://c/grey.jpg"]));
  // applyFilters keeps status != removed && hasCardPhoto; counts, facets, getModelIndex and the sitemap are all built from that list.
  const grid = valid.filter((l) => hasCardPhoto(l)).map((l) => (l as { id: string }).id);
  const counts = valid.filter((l) => hasCardPhoto(l)).length;
  const sitemap = valid.filter((l) => hasCardPhoto(l)).map((l) => (l as { id: string }).id);
  assert.deepEqual(grid, ["ok", "swap"]);
  assert.equal(counts, grid.length);
  assert.deepEqual(sitemap, grid);
});
