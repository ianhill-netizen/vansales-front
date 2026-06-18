import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

/* -----------------------------------------------------------------------------
   SEED CONTENT (optional)
   If a WP-harvest seed directory exists, use its markdown for the SEO intro copy
   and a matching hero image. Resolution order:
     1. SEED_DIR env var
     2. ./seed inside the repo (committed content, if any)
     3. ~/vansales-seed (local harvest)
   Falls back to generated placeholder copy when nothing matches. Build-safe:
   all filesystem access is wrapped and never throws.
   -------------------------------------------------------------------------- */

export interface SeedContent {
  title?: string;
  intro: string[]; // paragraphs
  heroImage?: string; // public path or absolute URL
  source: "seed" | "placeholder";
}

function seedDirs(): string[] {
  const dirs: string[] = [];
  if (process.env.SEED_DIR) dirs.push(process.env.SEED_DIR);
  dirs.push(join(process.cwd(), "seed")); // committed content, scoped to the repo
  // ~/vansales-seed is a local-harvest convenience only; skip in production
  // builds so the serverless bundle isn't traced beyond the project root.
  if (process.env.NODE_ENV !== "production") dirs.push(join(homedir(), "vansales-seed"));
  return dirs;
}

function findSeedFile(makeSlug: string, modelSlug: string): string | null {
  for (const dir of seedDirs()) {
    try {
      if (!existsSync(dir)) continue;
      const contentDir = existsSync(join(dir, "content")) ? join(dir, "content") : dir;
      const candidates = [
        `${makeSlug}-${modelSlug}.md`,
        `${modelSlug}.md`,
        join(makeSlug, `${modelSlug}.md`),
      ];
      for (const c of candidates) {
        const p = join(contentDir, c);
        if (existsSync(p)) return p;
      }
      // loose match across files
      const files = readdirSync(contentDir).filter((f) => f.endsWith(".md"));
      const hit = files.find((f) => f.toLowerCase().includes(modelSlug));
      if (hit) return join(contentDir, hit);
    } catch {
      /* ignore unreadable dirs */
    }
  }
  return null;
}

function stripFrontmatter(md: string): string {
  return md.replace(/^---[\s\S]*?---\s*/, "");
}

export function getModelSeed(
  makeSlug: string,
  modelSlug: string,
  names: { make: string; model: string },
): SeedContent {
  const file = findSeedFile(makeSlug, modelSlug);
  if (file) {
    try {
      const raw = stripFrontmatter(readFileSync(file, "utf8"));
      const paras = raw
        .split(/\n{2,}/)
        .map((p) => p.replace(/[#>*_`]/g, "").trim())
        .filter(Boolean)
        .slice(0, 3);
      if (paras.length) return { intro: paras, source: "seed" };
    } catch {
      /* fall through to placeholder */
    }
  }
  return { intro: placeholderIntro(names.make, names.model), source: "placeholder" };
}

function placeholderIntro(make: string, model: string): string[] {
  return [
    `The ${make} ${model} is one of the UK's most sought-after vans, and for good reason: it pairs car-like driving manners with a hard-working load bay that earns its keep day in, day out. Whether you're a sole trader after a dependable first van or a fleet buyer replacing tired stock, the ${model} holds its value and keeps running costs sensible.`,
    `Browse ${make} ${model} vans for sale below from trusted UK dealers and private sellers. Use the filters to narrow by price, registration year, wheelbase, body style and fuel — and check the ULEZ flag if you'll be working in a clean-air zone. Every listing shows the full spec up front, so you can compare payload, mileage and gearbox before you enquire.`,
  ];
}
