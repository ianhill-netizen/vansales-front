// One-off build-prep: curate per-make/model IMAGE SETS from the read-only WP
// harvest (~/vansales-seed) and bake them into the repo.
//
//   node scripts/generate-model-images.mjs
//
// Hard curation: drops logos/icons/banners/tiny/odd-aspect; prefers real van
// photos (object-cover) and falls back to studio cutouts (object-contain) for
// photo-poor models. Copies only what's used into public/media/models/<key>/.

import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join, extname } from "node:path";
import { homedir } from "node:os";
import { execFileSync } from "node:child_process";

const SEED = join(homedir(), "vansales-seed");
const SEED_IMAGES = join(SEED, "images");
const REPO = process.cwd();
const OUT_DIR = join(REPO, "public/media/models");
const OUT_TS = join(REPO, "lib/models/images.generated.ts");

const manifest = JSON.parse(readFileSync(join(SEED, "manifest.json"), "utf8"));

const MAKE_SLUG = {
  Volkswagen: "volkswagen", Ford: "ford", "Mercedes-Benz": "mercedes-benz",
  Vauxhall: "vauxhall", Renault: "renault", Citroën: "citroen", Fiat: "fiat",
  Peugeot: "peugeot", Toyota: "toyota", Nissan: "nissan", Iveco: "iveco",
};
const slugify = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// [make, model, includeRegex, excludeRegex|null]
const MODELS = [
  ["Volkswagen", "Transporter", /transporter/, /kombi/],
  ["Volkswagen", "Transporter Kombi", /transporter.*kombi|\bkombi\b/, null],
  ["Volkswagen", "Caddy", /caddy/, null],
  ["Volkswagen", "Crafter", /crafter/, null],
  ["Volkswagen", "Amarok", /amarok/, null],
  ["Ford", "Transit Custom", /transit.*custom|custom.*transit/, /connect|courier/],
  ["Ford", "Transit", /\btransit\b/, /custom|connect|courier/],
  ["Ford", "Transit Connect", /transit.*connect|\bconnect\b/, /courier/],
  ["Ford", "Transit Courier", /transit.*courier|\bcourier\b/, null],
  ["Ford", "Ranger", /ranger/, null],
  ["Mercedes-Benz", "Sprinter", /sprinter/, null],
  ["Mercedes-Benz", "Vito", /vito/, null],
  ["Mercedes-Benz", "Citan", /citan/, null],
  ["Vauxhall", "Vivaro", /vivaro/, /combi/],
  ["Vauxhall", "Combo", /\bcombo\b|\bcombi\b/, /vivaro/],
  ["Vauxhall", "Movano", /movano/, null],
  ["Renault", "Master", /master/, null],
  ["Renault", "Trafic", /trafic/, null],
  ["Renault", "Kangoo", /kangoo/, null],
  ["Citroën", "Berlingo", /berlingo/, null],
  ["Citroën", "Dispatch", /dispatch/, null],
  ["Citroën", "Relay", /relay/, null],
  ["Fiat", "Ducato", /ducato/, null],
  ["Fiat", "Doblo", /doblo/, null],
  ["Fiat", "Scudo", /scudo/, null],
  ["Peugeot", "Expert", /expert/, null],
  ["Peugeot", "Boxer", /boxer/, null],
  ["Peugeot", "Partner", /partner/, null],
  ["Toyota", "Proace", /proace/, /city/],
  ["Toyota", "Proace City", /proace.*city/, null],
  ["Toyota", "Hilux", /hilux/, null],
  ["Nissan", "Townstar", /townstar/, null],
  ["Nissan", "Interstar", /interstar/, null],
  ["Nissan", "Primastar", /primastar/, null],
  ["Iveco", "Daily", /daily/, null],
];

const JUNK = /\blogo\b|logo-|icon|sprite|favicon|placeholder|\bbanner\b|pattern|hero-bg|swoosh|badge|trustpilot|review|google-|map-|\bflag\b|arrow|\bstar\b|avatar|header|footer|\bqr\b|watermark/i;

// Visually-QA'd blocklist of off-model / low-quality source images (vintage,
// motorhomes, abstract render shots, staff/dealership-only photos, AI-generated
// Vansales.com marketing shots). Matched by source filename substring.
const BLOCKLIST = [
  // s1/s2 QA — wrong subject, abstract renders, staff photos, stock junk
  "pexels-photo-15240686.jpg",                                   // vintage split-screen VW
  "85992c15-ec05-4332-85f0-0a13348d0526.webp",                  // kombi — staff marketing shot
  "7bba64cf-2de8-4de2-8648-e0abe5c9fc83.png",                   // crafter — abstract floating parts
  "4ec48194-a17e-40f5-9a23-49ad41f5b736.webp",                  // amarok — staff dealership photo
  "e3ffd262-5a48-4a1f-aa41-a191c0284edd.png",                   // transit-custom — abstract engine render
  "fire-truck-gbc723031b_1280.jpg",                              // transit — fire truck (Pixabay)
  "camper-gb199b3653_1280.jpg",                                  // transit — motorhome/RV (Pixabay)
  "59e91bf6-dec0-4507-912b-de60f0ce4d47.webp",                  // transit — abstract floating-parts render
  "fe792bc5-636e-4c94-84e5-f258debe6858.webp",                  // transit-courier — staff photo
  "alloy-g597286cca_1280.webp",                                  // vito — alloy wheel closeup (Pixabay)
  "Mercedes-Vans-ddd91e20-0628-4e18-8f7e-e394c40f70c2.webp",   // sprinter — AI Vansales.com dealer
  "d53f99bb-1945-475f-97e2-4d5397c4ccf9.webp",                  // sprinter — AI Vansales.com staff
  "Mercedes-Vans-e2f5c5aa-6d9a-45a1-b87d-5dec063b82ec.webp",   // sprinter — AI Vanssales.com dealer rows
  "60d7166e-ce3b-420a-bece-8ccbc99e7337.webp",                  // sprinter — AI Vansales.com + staff
  "9078772a-aeed-4a9d-9007-9b66ca9cf7f1.webp",                  // sprinter — AI Vansales.com Luton
  // s3 QA — dealer forecourt rows, manufacturer showrooms, AI Vansales.com shots
  "e637d0a2-2124-4102-a8ac-b401513c8df0.webp",                  // vivaro — dealer forecourt rows
  "Screenshot-1-e1745000188115.webp",                            // vivaro — Vansales.cc branded dealer
  "Vauxhall-Vans7a3ddb9f-7542-4610-8920-c6fd46d4ef29.webp",    // vivaro — Toyota dealership exterior
  "9393a305-6004-4f62-b381-1932e9d1dc6d.webp",                  // combo — Vauxhall dealership + staff
  "Vauxhall-Vansd3c82eb3-3029-4acb-9362-4437b6ab2240.webp",    // combo — Vauxhall showroom interior
  "Vauxhall-Vans4a07e995-4fbb-40cb-bcd1-a16ddf9ac6a1.webp",    // combo — Vauxhall dealer exterior
  "Peugeot-Vans-71045445-fc67-4ae9-a9b7-96eb056ac257.webp",    // movano — dealer forecourt rows
  "465ded33-8f17-4ba0-92b9-8c8433479d2b.webp",                  // movano — dealer forecourt
  "Vauxhall-Vansaf8e9c2e-5d05-4874-b18d-888f3ddbd6e8.webp",    // movano — staff + Vansales branding
  "Renault-Master5294fc5b-a2d5-4817-97e2-bc24fcefcc06.webp",   // master — AI Vansales.com forecourt
  "Renault-Master7847bfbb-d183-431d-bf2d-bdbe53f3e6bc.webp",   // master — Renault dealer + staff
  "Reenult-Trafic-bf5891ba-1d2d-476c-bc89-7cbf3031e57a.webp",  // trafic — AI Vansales.com forecourt
  "Reenult-Trafic-bd144a97-b9f3-4b1b-b775-8f783485d5d0.webp",  // trafic — Renault dealer + staff
  "Screenshot-2024-06-14-at-15.38.46.webp",                     // trafic — dealer shot with branding
  // s4 QA — Kangoo forecourts, Berlingo parts/stock, Dispatch dealer, all-Ducato AI shots
  "3dfe3245-e53a-4e74-ae04-be1eb3df41ac.webp",                  // kangoo — Renault dealer + Vansales.com
  "df526c65-cd10-4d0d-b6e9-7086894d6fbd.webp",                  // kangoo — dealer forecourt
  "976c15cf-54fb-4776-b70d-62964b718e89.webp",                  // kangoo — person + van + Vansales.com
  "49f8d493-da57-4b41-8d9a-bf64e26d845b.png",                   // berlingo — mechanical tools/parts
  "road-trip-gdfaae05a5_1280.jpg",                               // berlingo — road trip stock (Pixabay)
  "ab1e9e67-6e8c-4428-990f-b84f5da15074.png",                   // berlingo — AI Vansales.com dealer
  "8f09652b-6ec1-4250-8846-d67cc8207da5.webp",                  // dispatch — Citroen dealer forecourt
  "508a878f-4f57-42af-bcd4-d202e3a7c835.webp",                  // dispatch — AI Vansales.com dealer
  "c0f7f142-5ca1-4115-ac6b-745c4401cfbe.webp",                  // ducato — AI Vansales.com aerial forecourt
  "c2454b47-58cd-4998-824a-abe1b6ab0972.webp",                  // ducato — AI Vansales.com forecourt rows
  "fa2b8241-bb97-480f-9a74-60514db5d9ce.webp",                  // ducato — AI Vansales.com VS-sign row
  "59a63da2-c36c-4834-a7f5-d7f2f582f353.webp",                  // ducato — AI Vansales.com + staff
  "cec3c7f2-dcf4-4e18-b9c2-d1ecf8818624.webp",                  // ducato — AI Vansales.com row at dusk
  "f55991a3-b5d3-46ea-80fe-054e912d1994.webp",                  // ducato — AI Vansales.com salesman
  "668120a9-4e03-4a55-aca5-2f4899dc5465.webp",                  // doblo — AI Vansales.com showroom
  "7b3a8226-cb84-46d5-a1ce-580f933a659e-1.webp",                // doblo — AI VANSALES.COM dealer exterior
  "d3fa92ae-a1f9-420a-9257-9a793466f969.webp",                  // doblo — AI Vansales.com dealer + staff
  "a614b955-0b9e-4ced-b04f-9ac84af20198.webp",                  // doblo — AI Vansales.com red-sign dealer
  "5ccf74bf-bf97-46f7-9a5b-00864d1a57c3-1.webp",               // scudo — AI Vansales.com forecourt
  "2f7f5c62-132c-4ad8-af16-0052041fc7b9.webp",                  // scudo — AI Vansales.com aerial
  "cc6bc8b2-d536-4593-85db-58484fe6e0ad.webp",                  // scudo — AI VanSales aerial rows
  // s5 QA — Expert/Boxer/Partner dealer forecourts, Proace AI Vansales.com
  "9c68d019-2296-402c-a5b0-1c00314bc4fa.webp",                  // expert — dealer forecourt rows
  "Peugeot-Vans-db7c5863-5d45-4bf1-9e8b-7103e7bae599-1.webp",  // expert — dealer forecourt
  "93b4fa74-3706-4b5b-961c-09a3dad448ea.webp",                  // boxer — dealer forecourt
  "d4c23097-88a9-4124-bd13-73052611b7a2.webp",                  // boxer — Peugeot dealership rows
  "36c5886f-8149-415b-9cd4-8f543d8ffdf5.webp",                  // partner — dealer forecourt rows
  "385a950f-9dce-4e92-b58a-1385b7446de3.webp",                  // partner — dealer shot
  "b718321e-4fc7-46b4-bbff-a288ea674ae4.webp",                  // proace — AI Vansales.com dealer rows
  "0a33d350-0789-43f8-bdff-60cece5dad2c.webp",                  // proace — AI dealer + person
  "10890f9c-77f9-4514-8599-bfc1dccbbd2e.webp",                  // proace — AI Vansales.com building
  // s6 QA — Hilux marketing/Toyota dealer shots
  "c6c75980-c784-4931-8e4c-c7e9a0ad90d3.png",                   // hilux — launch/marketing event
  "exterior-4-e1745077190335.webp",                              // hilux — Toyota forecourt + Vansales
  "4309aca6-725c-40aa-9329-54f239b4138f.webp",                  // hilux — Toyota dealership exterior
  // Post-regeneration checks — AI Vansales.com staff/dealer photos still bleeding through
  "f2a67c39-36ea-47ab-89cc-d98a06034da2.webp",                  // sprinter — AI 2-staff pose
  "421a0be7-0774-4038-9a0d-6996cea8b86e.webp",                  // sprinter — AI VanSales.com 2-staff
  "2c18ef45-edf5-4e56-a4c4-71afc0e98708.webp",                  // sprinter — AI Vansales.com 1-staff
  "fded086a-44a8-47a9-97ef-7490f837046b.webp",                  // sprinter — AI Vansales.com staff
  "9547858e-0462-4d3c-a60d-323da00bb634.webp",                  // vito — AI sci-fi fantasy render
  "93ff7816-134b-431e-9831-d767001b1c44.webp",                  // movano — AI Vauxhall dealer aerial
  "b28a931e-3732-4abb-ab32-1a5334a130d9.webp",                  // vito — AI Vansales.com 2-staff green
  "e74cf658-aa57-4824-8a0d-ba582666b221.webp",                  // vivaro — AI Vauxhall dealer forecourt
];
const SPAM = /casino|gambl|roulette|baccarat|padi[sş]ahbet|curacao|kasyn|kazino/i;

function isCutout(i) {
  return /background-removed/i.test(i.filename);
}
// Filename prefixes where EVERY image in the set has been confirmed AI-generated
// Vansales.com or branded dealer marketing (no individual files are real photos).
const BAD_PREFIXES = [
  "Mercedes-Vans-",  // AI Vansales.com + Mercedes dealership composites
  "Vauxhall-Vans",   // AI Vauxhall dealership forecourt composites
];

function baseCandidate(i) {
  if (!/image\/(jpeg|png|webp)/.test(i.mime_type)) return false;
  if (i.bytes < 11000 || i.bytes > 2_500_000) return false;
  if (JUNK.test(i.filename) || JUNK.test(i.alt_text || "")) return false;
  if (SPAM.test(i.alt_text || "") || SPAM.test(i.filename)) return false;
  if (!(i.alt_text && i.alt_text.trim().length > 3)) return false;
  if (BLOCKLIST.some((b) => i.filename.includes(b))) return false;
  if (BAD_PREFIXES.some((p) => i.filename.startsWith(p))) return false;
  return true;
}

const dimCache = new Map();
function dims(filename) {
  if (dimCache.has(filename)) return dimCache.get(filename);
  let d = null;
  try {
    const out = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", join(SEED_IMAGES, filename)], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const w = +(out.match(/pixelWidth:\s*(\d+)/) || [])[1];
    const h = +(out.match(/pixelHeight:\s*(\d+)/) || [])[1];
    if (w && h) d = { w, h };
  } catch {
    /* ignore */
  }
  dimCache.set(filename, d);
  return d;
}

const allCandidates = manifest.images.filter(baseCandidate);

const sets = {};
const srcMap = {};
let totalImages = 0;
let modelsWithSet = 0;
let curatedFrom = 0;

for (const [make, model, inc, exc] of MODELS) {
  const makeSlug = MAKE_SLUG[make] || slugify(make);
  const modelSlug = slugify(model);
  const key = `${makeSlug}/${modelSlug}`;

  const matches = allCandidates.filter((i) => {
    const a = (i.alt_text || "").toLowerCase();
    return inc.test(a) && !(exc && exc.test(a));
  });
  curatedFrom += matches.length;

  // photos first (real marketplace look), then studio cutouts; biggest first.
  const photos = matches.filter((i) => !isCutout(i)).sort((a, b) => b.bytes - a.bytes);
  const cutouts = matches.filter(isCutout).sort((a, b) => b.bytes - a.bytes);

  const picked = [];
  const seen = new Set();
  function consider(i, fit) {
    if (picked.length >= 6 || seen.has(i.filename)) return;
    const d = dims(i.filename);
    if (!d) return;
    if (d.w < 460) return; // too small for a hero/card
    const aspect = d.w / d.h;
    if (fit === "cover" && (aspect < 0.95 || aspect > 2.6)) return; // portrait / banners (square OK)
    if (fit === "contain" && d.w < 500) return;
    seen.add(i.filename);
    picked.push({ img: i, fit, w: d.w, h: d.h });
  }
  for (const p of photos) consider(p, "cover");
  for (const c of cutouts) consider(c, "contain");

  if (picked.length === 0) continue;

  const dir = join(OUT_DIR, makeSlug, modelSlug);
  mkdirSync(dir, { recursive: true });
  const entries = picked.map((p, idx) => {
    const ext = extname(p.img.filename) || ".webp";
    const name = `${idx + 1}${ext}`;
    copyFileSync(join(SEED_IMAGES, p.img.filename), join(dir, name));
    totalImages++;
    return {
      src: `/media/models/${makeSlug}/${modelSlug}/${name}`,
      alt: (p.img.alt_text || `${make} ${model}`).trim(),
      fit: p.fit,
      w: p.w,
      h: p.h,
    };
  });
  sets[key] = entries;
  srcMap[key] = picked.map((p, idx) => ({ out: entries[idx].src, source: p.img.filename }));
  modelsWithSet++;
}
writeFileSync("/tmp/imgmap.json", JSON.stringify(srcMap, null, 2));

// guard: no spam leaked into alts (defensive — keeps the build honest)
for (const [key, entries] of Object.entries(sets)) {
  for (const e of entries) if (SPAM.test(e.alt)) throw new Error(`spam alt in ${key}: ${e.alt}`);
}

// fresh output dir for the curated sets (remove stale single heroes)
// (we keep the directory but it's fully regenerated above)

const ts = `// AUTO-GENERATED by scripts/generate-model-images.mjs — do not edit by hand.
// Curated per-model image sets from the read-only vansales.com harvest.
// Hard-filtered: no logos/icons/banners/tiny/odd-aspect; spam-checked alts.

export interface ModelImage {
  src: string;
  alt: string;
  fit: "cover" | "contain"; // cover = real photo; contain = studio cutout on a surface
  w: number;
  h: number;
}

export const MODEL_IMAGE_SETS: Record<string, ModelImage[]> = ${JSON.stringify(sets, null, 2)};
`;
writeFileSync(OUT_TS, ts);

console.log(`models with image sets: ${modelsWithSet}/${MODELS.length}`);
console.log(`images imported: ${totalImages} (curated from ${curatedFrom} alt-matched candidates; ${allCandidates.length} total candidates)`);
const sizes = Object.values(sets).map((s) => s.length);
console.log(`set sizes: min ${Math.min(...sizes)} max ${Math.max(...sizes)} avg ${(sizes.reduce((a, b) => a + b, 0) / sizes.length).toFixed(1)}`);
console.log(`wrote ${OUT_TS}`);
