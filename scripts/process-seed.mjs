#!/usr/bin/env node
/**
 * One-time seed processor — reads ~/vansales-seed, writes:
 *   content/new-vans/index.json + per-slug JSON
 *   content/blog/index.json + per-slug .md files
 *   public/images/new-vans/*.webp (hero images)
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const HOME = process.env.HOME;
const SEED_DIR = path.join(HOME, "vansales-seed");
const SEED_CONTENT = path.join(SEED_DIR, "content");
const SEED_IMAGES = path.join(SEED_DIR, "images");
const REPO = process.cwd();
const OUT_VANS = path.join(REPO, "content/new-vans");
const OUT_BLOG = path.join(REPO, "content/blog");
const PUB_VANS = path.join(REPO, "public/images/new-vans");
const PUB_BLOG = path.join(REPO, "public/images/blog");

// ── helpers ───────────────────────────────────────────────────────────────────

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^(\w+):\s*"?([^"]*)"?\s*$/);
    if (m) meta[m[1]] = m[2].trim();
  }
  return { meta, body: match[2] };
}

function extractHeroImage(body) {
  // First: prefer Background-Removed image
  const bgMatch = body.match(/\.\.\/(images\/[^)\]"'\s]+Background-Removed[^)\]"'\s]*\.webp)/i);
  if (bgMatch) return bgMatch[1];
  // Fall back to first image reference
  const anyMatch = body.match(/\.\.\/(images\/[^)\]"'\s]+\.(?:webp|png|jpg))/i);
  if (anyMatch) return anyMatch[1];
  return null;
}

function cleanBody(body, heroImagePath) {
  let b = body;
  // Remove first image (the hero we already extracted)
  if (heroImagePath) {
    const imgFile = heroImagePath.replace("images/", "");
    // Remove any markdown image referencing this file
    b = b.replace(new RegExp(`\\[!\\[[^\\]]*\\]\\([^)]*${escapeRe(imgFile.slice(0, 20))}[^)]*\\)\\]\\([^)]*\\)`, "g"), "");
    b = b.replace(new RegExp(`!\\[[^\\]]*\\]\\([^)]*${escapeRe(imgFile.slice(0, 20))}[^)]*\\)`, "g"), "");
  }
  // Remove the duplicate H1 at top (title already shown in page)
  b = b.replace(/^#[^#].*\n/m, "");
  // Remove tab navigation stubs: -   [Description](#tab-description)
  b = b.replace(/^-\s+\[(?:Description|Features|Specifications)[^\]]*\]\(#[^)]*\)\n/gm, "");
  // Remove "See all X for sale" patterns
  b = b.replace(/See all [^.\n]+ for sale\n?/g, "");
  b = b.replace(/View More\n?/g, "");
  // Replace absolute vansales.com links with relative or plain text
  b = b.replace(/\[([^\]]+)\]\(https?:\/\/(?:www\.)?vansales\.com\/[^)]*\)/g, "$1");
  // Remove citation numbers [1], [2], etc.
  b = b.replace(/\s+\d+/g, "");
  // Remove empty lines > 2 consecutive
  b = b.replace(/\n{3,}/g, "\n\n");
  return b.trim();
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function slugToMakeModel(slug) {
  // slug is like "ford-transit-custom-lease" or "citroen-berlingo-crew-cab"
  const MAKES = {
    citroen: "Citroën",
    ford: "Ford",
    fiat: "Fiat",
    iveco: "Iveco",
    maxus: "Maxus",
    mercedes: "Mercedes-Benz",
    nissan: "Nissan",
    peugeot: "Peugeot",
    renault: "Renault",
    toyota: "Toyota",
    vauxhall: "Vauxhall",
    volkswagen: "Volkswagen",
    vw: "Volkswagen",
  };

  const SUFFIXES = ["-lease", "-luton", "-tipper", "-dropside", "-minibus", "-phev", "-2", "-3"];
  const PREFIXES = Object.keys(MAKES);

  let make = null;
  let rest = slug;
  for (const p of PREFIXES) {
    if (slug.startsWith(p + "-")) {
      make = MAKES[p];
      rest = slug.slice(p.length + 1);
      break;
    }
  }
  // Strip known suffixes
  for (const s of SUFFIXES) {
    if (rest.endsWith(s)) rest = rest.slice(0, -s.length);
  }

  const model = rest.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return { make, model };
}

function titleCase(s) {
  return s.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function firstParagraph(body) {
  const lines = body.split("\n");
  for (const l of lines) {
    const t = l.trim();
    if (t.length > 80 && !t.startsWith("#") && !t.startsWith("-") && !t.startsWith("|") && !t.startsWith("!")) {
      return t.slice(0, 155).replace(/\s\S+$/, "…");
    }
  }
  return "";
}

function copyImage(srcName, destDir) {
  const src = path.join(SEED_IMAGES, srcName);
  if (!fs.existsSync(src)) return false;
  const dest = path.join(destDir, srcName);
  if (!fs.existsSync(dest)) fs.copyFileSync(src, dest);
  return true;
}

// ── SPAM FILTERS ─────────────────────────────────────────────────────────────

const SPAM_KEYWORDS = [
  "casino", "baccarat", "roulette", "neteller", "bitcoin", "gambling",
  "poker", "blackjack", "spielen", "kazino", "bettor", "slot-",
  "slots-", "free-slot", "slots-machine", "free-port-games", "port-games",
  "crypto", "ether", "binance", "stake", "betway", "lotterie",
  "loto", "loteria", "apostas", "gioco", "gioca", "ruleta", "maquinas",
  "gratis", "gier-kasynow", "darmowych", "ideales-machine", "auto-clear-wrap",
  "get-laid", "dating", "escort", "hookup",
  "money-slots", "real-money", "online-slots", "slot-machine", "free-slots",
  "winning-free", "fortune", "jackpot", "bonus-spins", "free-spin",
];

// Van-related content check — post must contain at least one of these
const VAN_KEYWORDS = [
  "van", "transit", "transporter", "sprinter", "vivaro", "ducato",
  "berlingo", "master", "trafic", "daily", "crafter", "movano",
  "commercial vehicle", "fleet", "lease", "payload", "cargo",
  "tipper", "luton", "dropside", "panel van", "minibus",
  "ford", "volkswagen", "mercedes", "vauxhall", "citroen", "renault",
  "peugeot", "toyota", "nissan", "fiat", "iveco",
];

const BODY_SPAM_KEYWORDS = [
  "slot machine", "free slots", "casino bonus", "online casino", "real money",
  "jackpot", "poker chip", "roulette wheel", "baccarat", "sports betting",
  "cryptocurrency", "bitcoin casino", "free spins", "wild symbol", "payline",
  "scatter symbol", "bonus round", "wagering requirement", "casino review",
  "sex", "escort", "hookup", "dating site", "adult",
  "maquinas", "ruleta", "kazino", "spielautomaten", "automaten",
  "darmowych gier", "gier kasynowych", "kasyna", "automaty",
  // Portuguese/Spanish/French/Polish gambling
  "cassino", "roleta", "apostas", "jogo de", "jogos de", "poker online",
  "bonus de bienvenida", "bono de", "casino en ligne", "machines à sous",
  "rulette", "spielen sie", "spielautomaten", "beste online",
];

function isSpam(filename, title = "", body = "") {
  const f = filename.toLowerCase();
  const t = (title || "").toLowerCase();
  const b = (body || "").toLowerCase();
  if (f.startsWith("%")) return true; // URL-encoded filenames = foreign spam
  if (/^\d+(-\d+)?\.md$/.test(filename)) return true; // numbered spam posts
  for (const kw of SPAM_KEYWORDS) {
    if (f.includes(kw) || t.includes(kw)) return true;
  }
  // Body-level spam keywords
  for (const kw of BODY_SPAM_KEYWORDS) {
    if (b.includes(kw)) return true;
  }
  // Foreign language detection: high ratio of non-ASCII chars in title/slug
  const nonAscii = (title.match(/[^\x00-\x7F]/g) || []).length;
  if (nonAscii > title.length * 0.1) return true;
  return false;
}

function isVanRelated(body) {
  const b = (body || "").toLowerCase();
  // Require at least 2 van keywords OR 1 keyword appearing 3+ times
  const matches = VAN_KEYWORDS.filter((kw) => {
    const re = new RegExp(`\\b${kw}\\b`, "g");
    return (b.match(re) || []).length >= 1;
  });
  const dominant = VAN_KEYWORDS.filter((kw) => {
    const re = new RegExp(`\\b${kw}\\b`, "g");
    return (b.match(re) || []).length >= 3;
  });
  return matches.length >= 2 || dominant.length >= 1;
}

const SKIP_SLUGS = new Set([
  "about-us", "cart", "checkout", "commission-disclosure", "complaints-policy-of-swiss-vans-ltd",
  "complaints-procedure", "conflict-of-interest-policy", "contact-us", "cookie-policy-uk",
  "data-protection-policy", "home", "van-finance", "van-insurance", "business-finance",
  "business-van-lease", "business-vehicle-finance", "advert-explanation-clear-and-simple",
  "get-advice-and-share-your-experiences-along-with-other-single-parents",
  "audi-s6-estate-for-sale", // not a van
]);

// ── PROCESS PRODUCTS ─────────────────────────────────────────────────────────

console.log("Processing products…");
const productFiles = fs.readdirSync(SEED_CONTENT)
  .filter((f) => f.startsWith("product-") && !f.startsWith("product-category") && f.endsWith(".md"));

const productIndex = [];

for (const file of productFiles) {
  const raw = fs.readFileSync(path.join(SEED_CONTENT, file), "utf8");
  const { meta, body } = parseFrontmatter(raw);
  if (!meta.title) continue;

  // Derive slug from filename (strip "product-" prefix)
  const slug = file.replace(/^product-/, "").replace(/\.md$/, "");

  const heroImageRef = extractHeroImage(body);
  let heroImage = null;
  if (heroImageRef) {
    const imgFile = heroImageRef.replace("images/", "");
    if (copyImage(imgFile, PUB_VANS)) {
      heroImage = `/images/new-vans/${imgFile}`;
    }
    // Also try the 600x version for the same base filename
    const base600 = imgFile.replace(/(\.\w+)$/, "-600x$1").replace("-600x.", "").replace(/\.webp$/, "-600x.webp");
    // (not critical — just use the main file)
  }

  const cleanedBody = cleanBody(body, heroImageRef);
  const description = firstParagraph(cleanedBody);
  const { make, model } = slugToMakeModel(slug);

  // Clean up title (strip " Lease" suffix for cleaner H1)
  const title = (meta.title || "")
    .replace(/\s*Lease(?:\s+Deals?)?$/i, "")
    .replace(/:\s.*$/, "")  // strip subtitle
    .trim();

  // Dealski filter link
  const dealskiParams = new URLSearchParams();
  if (make) dealskiParams.set("make", make);
  // Only add model if it's reasonably short and specific
  if (model && model.split(" ").length <= 4) dealskiParams.set("model", model.replace(/ (?:Crew Cab|Double Cab|Luton|Tipper|Minibus|PHEV|Automatic|Limited|Sport)$/i, "").trim());
  const stockHref = `/vans?${dealskiParams.toString()}`;

  const entry = {
    slug,
    title,
    make: make || "Van",
    model,
    heroImage,
    description,
    stockHref,
    wordCount: parseInt(meta.word_count || "0"),
  };

  productIndex.push(entry);

  // Write per-slug JSON
  fs.writeFileSync(
    path.join(OUT_VANS, `${slug}.json`),
    JSON.stringify({ ...entry, body: cleanedBody }, null, 2),
  );

  process.stdout.write(".");
}

// Write product index
fs.writeFileSync(
  path.join(OUT_VANS, "index.json"),
  JSON.stringify(productIndex.sort((a, b) => a.make.localeCompare(b.make)), null, 2),
);

console.log(`\nProducts: ${productIndex.length} written`);

// ── PROCESS BLOG POSTS ───────────────────────────────────────────────────────

console.log("Processing blog posts…");

const allFiles = fs.readdirSync(SEED_CONTENT).filter((f) => f.endsWith(".md"));
const blogIndex = [];

for (const file of allFiles) {
  const slug = file.replace(/\.md$/, "");
  if (SKIP_SLUGS.has(slug)) continue;
  if (file.startsWith("product") || file.startsWith("brand") || file.startsWith("tag") || file.startsWith("author")) continue;
  if (file.startsWith("category") || file.startsWith("fuel-") || file.startsWith("about")) continue;
  if (isSpam(file)) continue;

  const raw = fs.readFileSync(path.join(SEED_CONTENT, file), "utf8");
  const { meta, body } = parseFrontmatter(raw);

  // Must be a post type with a date and enough words
  if (meta.type !== "posts") continue;
  if (!meta.date || !meta.date.match(/^\d{4}/)) continue;
  if (parseInt(meta.word_count || "0") < 400) continue;
  if (isSpam(file, meta.title, body)) continue;
  if (!isVanRelated(body)) continue;

  // Clean body
  let cleanedBody = body;
  // Remove duplicate H1
  cleanedBody = cleanedBody.replace(/^#[^#].*\n/m, "");
  // Replace absolute vansales.com links
  cleanedBody = cleanedBody.replace(/\[([^\]]+)\]\(https?:\/\/(?:www\.)?vansales\.com\/[^)]*\)/g, "$1");
  // Remove citation numbers
  cleanedBody = cleanedBody.replace(/\s+\d+/g, "");
  cleanedBody = cleanedBody.replace(/\n{3,}/g, "\n\n").trim();

  // Extract inline images referenced
  const imgRefs = [...cleanedBody.matchAll(/\.\.\/(images\/[^)\]"'\s]+\.(?:webp|png|jpg))/gi)];
  for (const m of imgRefs) {
    const imgFile = m[1].replace("images/", "");
    // Skip thumbnail variants
    if (imgFile.match(/-\d+x\d+\./)) continue;
    if (copyImage(imgFile, PUB_BLOG)) {
      cleanedBody = cleanedBody.replace(m[0], `/images/blog/${imgFile}`);
    } else {
      // Remove the broken image reference
      cleanedBody = cleanedBody.replace(new RegExp(`!\\[[^\\]]*\\]\\(\\.\\./${escapeRe(m[1])}\\)`, "g"), "");
    }
  }

  const description = firstParagraph(cleanedBody);
  const title = meta.title || titleCase(slug.replace(/-/g, " "));

  const entry = {
    slug,
    title,
    date: meta.date,
    description,
  };
  blogIndex.push(entry);

  // Write cleaned markdown file
  const outMd = `---\ntitle: "${title.replace(/"/g, "'")}"\nslug: ${slug}\ndate: ${meta.date}\nexcerpt: "${description.replace(/"/g, "'")}"\n---\n\n${cleanedBody}\n`;
  fs.writeFileSync(path.join(OUT_BLOG, `${slug}.md`), outMd);
  process.stdout.write(".");
}

// Sort by date desc
blogIndex.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
fs.writeFileSync(path.join(OUT_BLOG, "index.json"), JSON.stringify(blogIndex, null, 2));
console.log(`\nBlog posts: ${blogIndex.length} written`);

console.log("Done ✓");
