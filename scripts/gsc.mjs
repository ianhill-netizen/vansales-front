#!/usr/bin/env node
// Google Search Console client for vansales.com (service account). Needs the service account added as a user (Full) on the Search Console property.
//
//   node scripts/gsc.mjs sitemap submit [sitemapUrl]       submit https://vansales.com/sitemap.xml (or the given URL)
//   node scripts/gsc.mjs sitemap list                      the sitemaps Google has for the property, with errors/warnings
//   node scripts/gsc.mjs index urls.txt                    Indexing API: URL_UPDATED for every URL in the file (one per line). 200 requests a day by default; see the note below.
//   node scripts/gsc.mjs pages [--urls file] [--only 404,crawled_not_indexed,indexed] [--out tmp/gsc-pages.csv] [--limit N]
//                                                          URL Inspection for every URL in the sitemaps (plus --urls), written to CSV with the Pages-report bucket for each
//   node scripts/gsc.mjs analytics [--days 28] [--out tmp/gsc-analytics.csv]    pages with impressions/clicks (Search Analytics)
//   node scripts/gsc.mjs issues                            explains why Security Issues and Manual Actions cannot be read here
//
// Credentials, first found: $GSC_SA_JSON (the JSON itself, for CI), $GSC_SA_KEY_FILE, ~/.config/gsc/vansales-sa.json. Property: $GSC_SITE (default https://vansales.com/ ; use sc-domain:vansales.com for a Domain property).
// What the API cannot do (Google offers no endpoint): export the Pages report itself, list "Not found (404)" URLs Google knows but that are not in your sitemaps, or read Security Issues / Manual Actions.
// Those need the Search Console UI export. `pages` checks the URLs you give it (sitemap URLs by default) one by one with URL Inspection (2,000 a day per property).
// The Indexing API is documented by Google for JobPosting and BroadcastEvent pages only; it accepts other URLs but Google may ignore them. Use it knowingly.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { bucket, delayMs, parseUrlList, sitemapLocs, toCsv } from "./gsc-lib.mjs";

const SITE = process.env.GSC_SITE || "https://vansales.com/";
const SITEMAP = "https://vansales.com/sitemap.xml";
const KEY_FILE = process.env.GSC_SA_KEY_FILE || join(homedir(), ".config", "gsc", "vansales-sa.json");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function credentials() {
  if (process.env.GSC_SA_JSON) return JSON.parse(process.env.GSC_SA_JSON);
  if (existsSync(KEY_FILE)) return JSON.parse(readFileSync(KEY_FILE, "utf8"));
  return null;
}

async function clients(scopes) {
  const creds = credentials();
  if (!creds) return null;
  const { google } = await import("googleapis");
  const auth = new google.auth.GoogleAuth({ credentials: creds, scopes });
  return { google, auth };
}

const arg = (name, fallback) => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : fallback; };

async function allSitemapUrls(start = SITEMAP) {
  const out = []; const seen = new Set(); const queue = [start];
  while (queue.length) {
    const u = queue.shift();
    if (seen.has(u)) continue;
    seen.add(u);
    const xml = await (await fetch(u)).text();
    for (const loc of sitemapLocs(xml)) (loc.endsWith(".xml") ? queue : out).push(loc);
  }
  return [...new Set(out)];
}

async function main() {
  const [cmd, sub] = process.argv.slice(2);
  const writeCsv = (path, header, rows) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, toCsv(header, rows)); console.log(`${rows.length} rows -> ${path}`); };

  if (cmd === "issues") {
    console.log("Security Issues and Manual Actions have no Search Console API endpoint, so they cannot be read from a script.\nCheck them at https://search.google.com/search-console/security-issues and https://search.google.com/search-console/manual-actions (Search Console emails the property owners when either appears).");
    return;
  }
  const scopes = ["https://www.googleapis.com/auth/webmasters", ...(cmd === "index" ? ["https://www.googleapis.com/auth/indexing"] : [])];
  const c = await clients(scopes);
  if (!c) { console.log(`No service-account credentials (set GSC_SA_JSON or put the key at ${KEY_FILE}). Nothing to do: skipping.`); return; }
  const sc = c.google.searchconsole({ version: "v1", auth: c.auth });

  if (cmd === "sitemap" && sub === "submit") {
    const feed = process.argv[4] || SITEMAP;
    await sc.sitemaps.submit({ siteUrl: SITE, feedpath: feed });
    console.log(`submitted ${feed} for ${SITE}`);
  } else if (cmd === "sitemap" && sub === "list") {
    const r = await sc.sitemaps.list({ siteUrl: SITE });
    for (const s of r.data.sitemap ?? []) console.log(`${s.path}  submitted ${s.lastSubmitted ?? "-"}  downloaded ${s.lastDownloaded ?? "-"}  errors ${s.errors ?? 0}  warnings ${s.warnings ?? 0}  pending ${s.isPending ?? false}`);
  } else if (cmd === "index") {
    const file = process.argv[3];
    if (!file) throw new Error("usage: gsc.mjs index <file-with-urls>");
    const urls = parseUrlList(readFileSync(file, "utf8"));
    const indexing = c.google.indexing({ version: "v3", auth: c.auth });
    let ok = 0;
    for (const url of urls) {
      try { await indexing.urlNotifications.publish({ requestBody: { url, type: "URL_UPDATED" } }); ok++; console.log("ok   " + url); }
      catch (e) { console.log(`FAIL ${url}  ${e.message}`); if (/quota|429/i.test(e.message)) { console.log("quota reached: stopping"); break; } }
      await sleep(delayMs(300));
    }
    console.log(`${ok}/${urls.length} notified`);
  } else if (cmd === "pages") {
    const only = arg("only", "") ? arg("only").split(",") : null;
    let urls = process.argv.includes("--urls") ? parseUrlList(readFileSync(arg("urls"), "utf8")) : [];
    urls = [...new Set([...urls, ...(await allSitemapUrls())])];
    if (arg("limit")) urls = urls.slice(0, Number(arg("limit")));
    const rows = [];
    for (const url of urls) {
      try {
        const r = await sc.urlInspection.index.inspect({ requestBody: { inspectionUrl: url, siteUrl: SITE, languageCode: "en-GB" } });
        const i = r.data.inspectionResult?.indexStatusResult ?? {};
        rows.push({ url, bucket: bucket(i.coverageState, i.verdict), coverage_state: i.coverageState, verdict: i.verdict, robots_txt: i.robotsTxtState, indexing_state: i.indexingState, last_crawl: i.lastCrawlTime, google_canonical: i.googleCanonical, user_canonical: i.userCanonical });
      } catch (e) { rows.push({ url, bucket: "error", coverage_state: e.message }); }
      await sleep(delayMs(300));
    }
    const keep = only ? rows.filter((r) => only.includes(r.bucket)) : rows;
    const counts = {}; for (const r of rows) counts[r.bucket] = (counts[r.bucket] ?? 0) + 1;
    console.log(counts);
    writeCsv(arg("out", "tmp/gsc-pages.csv"), ["url", "bucket", "coverage_state", "verdict", "robots_txt", "indexing_state", "last_crawl", "google_canonical", "user_canonical"], keep);
  } else if (cmd === "analytics") {
    const days = Number(arg("days", "28"));
    const end = new Date(Date.now() - 2 * 86400000); const start = new Date(end.getTime() - days * 86400000);
    const f = (d) => d.toISOString().slice(0, 10);
    const r = await sc.searchanalytics.query({ siteUrl: SITE, requestBody: { startDate: f(start), endDate: f(end), dimensions: ["page"], rowLimit: 25000 } });
    const rows = (r.data.rows ?? []).map((x) => ({ page: x.keys[0], clicks: x.clicks, impressions: x.impressions, ctr: x.ctr, position: x.position }));
    writeCsv(arg("out", "tmp/gsc-analytics.csv"), ["page", "clicks", "impressions", "ctr", "position"], rows);
  } else {
    console.log("usage: gsc.mjs sitemap submit|list | index <file> | pages [--urls f] [--only buckets] [--limit n] | analytics [--days n] | issues");
  }
}
main().catch((e) => { console.error(e.message); process.exit(1); });
