// One-off build-prep: read ~/vansales-seed, SANITISE the legit van-model copy
// (strip malware spam, links, WP chrome), pick a real hero image per model, and
// bake everything into lib/models/content.generated.ts + public/media/models/.
//
// NOT part of the Next build. Run manually:  node scripts/generate-model-content.mjs
// Requires ~/vansales-seed (the read-only WP harvest).

import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join, extname } from "node:path";
import { homedir } from "node:os";

const SEED = join(homedir(), "vansales-seed");
const SEED_CONTENT = join(SEED, "content");
const SEED_IMAGES = join(SEED, "images");
const REPO = process.cwd();
const OUT_TS = join(REPO, "lib/models/content.generated.ts");
const OUT_IMG = join(REPO, "public/media/models");
mkdirSync(OUT_IMG, { recursive: true });

const manifest = JSON.parse(readFileSync(join(SEED, "manifest.json"), "utf8"));

// ---- spam detection -------------------------------------------------------
const SPAM_RE =
  /casino|gambl|padi[sş]ahbet|curacao|roulette|baccarat|\bslot[s]?\b|\bbet(s|ting|giri)|sportsbook|\bpoker\b|jackpot|kasyn|kazino|kasino|aviator|\bbahis\b|wetten|ruleta|ruletka|deposit bonus|neteller|crypto.?casino|7kontinent|drakkar|crowngold|chikenroad|iqsoft\.kz|\.kz\b/i;
const ALLOWED_LINK_HOSTS =
  /(^|\.)vansales\.com|(^|\.)swissvans\.com|wikipedia\.org|\.gov\.uk|fca\.org\.uk|ford\.co\.uk|mercedes-benz\.co\.uk|volkswagen-vans\.co\.uk/i;

function stripToProse(md) {
  // drop frontmatter
  let body = md.replace(/^---[\s\S]*?---\s*/, "");
  // remove markdown images entirely
  body = body.replace(/!\[[^\]]*\]\([^)]*\)/g, "");
  // links [text](url) -> text  (kills every outbound URL, spam or not)
  body = body.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  // any stray bare URLs
  body = body.replace(/https?:\/\/\S+/g, "");
  // escaped artefacts
  body = body.replace(/\\\(|\\\)|\\-/g, " ").replace(/[ \t]+/g, " ");
  return body;
}

const CHROME_RE =
  /^(filter|filters|any manufacturer|any model|select transmission|show \(|transmission|description|features|home|all vans|van sales|- select|menu|search|sort by|read more|previous|next|share)\b/i;

function extractIntro(md, maxParas = 4) {
  const prose = stripToProse(md);
  const blocks = prose.split(/\n{2,}/).map((b) => b.replace(/\s+/g, " ").trim());
  const out = [];
  for (let b of blocks) {
    b = b.replace(/^#{1,6}\s+/, "").replace(/^[-*]\s+/, "").trim();
    if (!b) continue;
    if (/[…]|\.{3}/.test(b)) continue; // drop truncated WP excerpt blocks
    // strip dangling "See <Title…>" link-CTAs and "Source" leftovers (links removed earlier)
    b = b
      .replace(/\s+See\s+[A-Z][^.!?]*$/g, "")
      .replace(/\s+See\s+[A-Z][^.!?]*(?=[.!?])/g, "")
      .replace(/\s*\(?Source\)?\s*$/i, "")
      .replace(/\s{2,}/g, " ")
      .trim();
    if (b.length < 90) continue; // skip nav/section titles/fragments
    if (CHROME_RE.test(b)) continue;
    if (!/[a-z]/.test(b)) continue;
    if (!/[.!?]/.test(b)) continue;
    if (!/^[A-Z“"]/.test(b)) continue; // skip mid-sentence excerpt fragments
    if (out.some((p) => p.includes(b) || b.includes(p))) continue; // de-dupe
    out.push(b);
    if (out.length >= maxParas) break;
  }
  return out;
}

// Accurate generated copy for models with only a thin WP archive page.
const DESCRIPTOR = {
  "vauxhall/movano": "large panel van built for maximum load space and payload",
  "peugeot/partner": "compact, economical city van that's easy to live with",
  "nissan/primastar": "versatile medium panel van suited to everyday trade work",
  "mercedes-benz/vito": "refined mid-size van that drives like a car and works like a pro",
};
function generatedIntro(make, model, key) {
  const d = DESCRIPTOR[key] || "hard-working van trusted by UK businesses";
  return [
    `The ${make} ${model} is a ${d}. It's a dependable choice for sole traders and fleets alike, balancing running costs, comfort and practicality for work across the UK.`,
    `Browse ${make} ${model} vans for sale below from trusted UK dealers. Use the filters to narrow by price, year, wheelbase, body style and fuel, and check the ULEZ flag if you'll be working in a clean-air zone — every listing shows the full spec up front.`,
  ];
}

// ---- hero image index by alt_text ----------------------------------------
function pickHero({ incRe, excRe }) {
  let best = null;
  let bestScore = -1;
  for (const img of manifest.images) {
    const alt = (img.alt_text || "").toLowerCase();
    if (!alt) continue;
    if (!incRe.test(alt)) continue;
    if (excRe && excRe.test(alt)) continue;
    if (!/image\/(jpeg|png|webp)/.test(img.mime_type)) continue;
    if (img.bytes < 4000) continue; // skip icons
    const forSale = /for sale/.test(alt) ? 600000 : 0;
    const bg = /background-removed/i.test(img.filename) ? 250000 : 0;
    const score = forSale + bg + img.bytes;
    if (score > bestScore) {
      bestScore = score;
      best = img;
    }
  }
  return best;
}

// ---- model registry -------------------------------------------------------
const MAKE_SLUG = {
  Volkswagen: "volkswagen",
  Ford: "ford",
  "Mercedes-Benz": "mercedes-benz",
  Vauxhall: "vauxhall",
  Renault: "renault",
  Citroën: "citroen",
  Fiat: "fiat",
  Peugeot: "peugeot",
  Toyota: "toyota",
  Nissan: "nissan",
  Iveco: "iveco",
};
const slugify = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// [make, model, productSlug|null, incRe, excRe]
const MODELS = [
  ["Volkswagen", "Transporter", "product-vw-transporter-lease", /transporter/, /kombi/],
  ["Volkswagen", "Transporter Kombi", "product-vw-transporter-kombi-lease", /transporter.*kombi|\bkombi\b/, null],
  ["Volkswagen", "Caddy", "product-vw-caddy-lease", /caddy/, null],
  ["Volkswagen", "Crafter", "product-vw-crafter-lease", /crafter/, /luton|tipper|dropside/],
  ["Volkswagen", "Amarok", "product-vw-amarok-lease", /amarok/, null],
  ["Ford", "Transit Custom", "product-ford-transit-custom-lease", /transit.*custom|custom.*transit/, /connect|courier/],
  ["Ford", "Transit", "product-ford-transit-lease", /\btransit\b/, /custom|connect|courier|tipper|luton|double|e-transit/],
  ["Ford", "Transit Connect", "product-ford-transit-connect-lease", /transit.*connect|\bconnect\b/, /courier/],
  ["Ford", "Transit Courier", "product-ford-transit-courier-lease", /transit.*courier|\bcourier\b/, null],
  ["Ford", "Ranger", "product-ford-ranger-lease", /ranger/, null],
  ["Mercedes-Benz", "Sprinter", "product-mercedes-sprinter-lease", /sprinter/, /luton|tipper/],
  ["Mercedes-Benz", "Vito", "product-mercedes-vito-crew-cab-lease", /vito/, null],
  ["Mercedes-Benz", "Citan", "product-mercedes-citan-lease", /citan/, null],
  ["Vauxhall", "Vivaro", "product-vauxhall-vivaro-lease-2", /vivaro/, /combi/],
  ["Vauxhall", "Combo", "product-vauxhall-combi-lease", /\bcombo\b|\bcombi\b/, /vivaro/],
  ["Vauxhall", "Movano", null, /movano/, null],
  ["Renault", "Master", "product-renault-master-lease", /master/, /luton|tipper|low loader/],
  ["Renault", "Trafic", "product-renault-trafic-lease", /trafic/, /crew/],
  ["Renault", "Kangoo", "product-renault-kangoo-lease", /kangoo/, null],
  ["Citroën", "Berlingo", "product-citroen-berlingo-lease", /berlingo/, /crew/],
  ["Citroën", "Dispatch", "product-citroen-dispatch-lease", /dispatch/, /crew/],
  ["Citroën", "Relay", "product-citroen-relay-lease", /relay/, /tipper/],
  ["Fiat", "Ducato", "product-fiat-ducato-lease", /ducato/, /luton/],
  ["Fiat", "Doblo", "product-fiat-doblo-lease", /doblo/, null],
  ["Fiat", "Scudo", "product-fiat-scudo-lease", /scudo/, /crew/],
  ["Peugeot", "Expert", "product-peugeot-expert-lease", /expert/, null],
  ["Peugeot", "Boxer", "product-peugeot-boxer-lease", /boxer/, null],
  ["Peugeot", "Partner", null, /partner/, null],
  ["Toyota", "Proace", "product-toyota-proace-lease-2", /proace/, /city|crew|sport/],
  ["Toyota", "Proace City", "product-toyota-proace-city-lease", /proace.*city/, null],
  ["Toyota", "Hilux", "product-toyota-hilux-lease", /hilux/, null],
  ["Nissan", "Townstar", "product-nissan-townstar-lease", /townstar/, null],
  ["Nissan", "Interstar", "product-nissan-interstar-tipper", /interstar/, null],
  ["Nissan", "Primastar", null, /primastar/, null],
  ["Iveco", "Daily", "product-iveco-daily-lease", /daily/, /minibus/],
];

// ---- build ----------------------------------------------------------------
const records = {};
const usedImages = [];
let withCopy = 0;
let withProduct = 0;
let withHero = 0;
const spamFound = [];

for (const [make, model, productSlug, incRe, excRe] of MODELS) {
  const makeSlug = MAKE_SLUG[make] || slugify(make);
  const modelSlug = slugify(model);
  const key = `${makeSlug}/${modelSlug}`;

  // copy: prefer product page, else the test-model archive
  let intro = [];
  let sourceUrl = "";
  let sourceType = "generated";
  const tryFiles = [];
  if (productSlug) tryFiles.push(productSlug);
  tryFiles.push(`test-model-${modelSlug}`);
  for (const f of tryFiles) {
    const p = join(SEED_CONTENT, `${f}.md`);
    if (!existsSync(p)) continue;
    const raw = readFileSync(p, "utf8");
    const isProduct = f.startsWith("product-");
    const paras = extractIntro(raw, 4);
    // Only trust product-page prose; the test-model archive line is generic and
    // sometimes inaccurate, so substitute accurate generated copy for those.
    if (isProduct && paras.length >= 2) {
      intro = paras;
      sourceType = "product";
      const m = raw.match(/^source_url:\s*"?([^"\n]+)"?/m);
      sourceUrl = m ? m[1] : "";
      break;
    }
  }
  if (!intro.length) {
    intro = generatedIntro(make, model, key);
    sourceType = "generated";
  }
  if (intro.length) withCopy++;
  if (sourceType === "product") withProduct++;

  // hero image
  const hero = pickHero({ incRe, excRe });
  let heroPath = null;
  let heroAlt = null;
  if (hero) {
    const src = join(SEED_IMAGES, hero.filename);
    if (existsSync(src)) {
      const ext = extname(hero.filename) || ".webp";
      const destName = `${makeSlug}-${modelSlug}${ext}`;
      copyFileSync(src, join(OUT_IMG, destName));
      heroPath = `/media/models/${destName}`;
      heroAlt = hero.alt_text || `${make} ${model}`;
      usedImages.push({ model: key, file: destName, from: hero.filename, alt: heroAlt, bytes: hero.bytes });
      withHero++;
    }
  }

  // SPAM VERIFICATION on the baked output
  for (const para of intro) {
    if (SPAM_RE.test(para)) spamFound.push({ key, para: para.slice(0, 120) });
    const urls = para.match(/https?:\/\/[^\s)]+/g) || [];
    for (const u of urls) {
      const host = u.replace(/^https?:\/\//, "").split("/")[0];
      if (!ALLOWED_LINK_HOSTS.test(host)) spamFound.push({ key, link: u });
      else spamFound.push({ key, residualLink: u }); // we strip ALL links, so any URL is a bug
    }
  }

  records[key] = {
    make,
    makeSlug,
    model,
    modelSlug,
    title: `${make} ${model}`,
    intro,
    hero: heroPath,
    heroAlt,
    sourceUrl,
    sourceType,
  };
}

if (spamFound.length) {
  console.error("SPAM/RESIDUAL-LINK CHECK FAILED:", JSON.stringify(spamFound, null, 2));
  process.exit(1);
}

// ---- emit TS --------------------------------------------------------------
const header = `// AUTO-GENERATED by scripts/generate-model-content.mjs — do not edit by hand.
// Source: read-only harvest of vansales.com (~/vansales-seed), sanitised:
// malware spam stripped, ALL outbound links removed, WP chrome dropped.
// Verified: 0 spam links / 0 residual URLs in the copy below.

export interface ModelContent {
  make: string;
  makeSlug: string;
  model: string;
  modelSlug: string;
  title: string;
  intro: string[];
  hero: string | null;
  heroAlt: string | null;
  sourceUrl: string;
  sourceType: "product" | "models" | "generated";
}

export const MODEL_CONTENT: Record<string, ModelContent> = ${JSON.stringify(records, null, 2)};

export function getModelContent(makeSlug: string, modelSlug: string): ModelContent | null {
  return MODEL_CONTENT[\`\${makeSlug}/\${modelSlug}\`] ?? null;
}

/** Hero image path for a make/model, or null. Keyed leniently for feed lookups. */
export function modelImage(makeSlug: string, modelSlug: string): string | null {
  return MODEL_CONTENT[\`\${makeSlug}/\${modelSlug}\`]?.hero ?? null;
}
`;
writeFileSync(OUT_TS, header);

console.log(`models: ${MODELS.length} | with copy: ${withCopy} (real product copy: ${withProduct}, generated: ${withCopy - withProduct}) | with hero: ${withHero}`);
console.log(`images copied: ${usedImages.length} → public/media/models/`);
console.log(`spam/residual links: 0  ✓`);
console.log(`wrote ${OUT_TS}`);
