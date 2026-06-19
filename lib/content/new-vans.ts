import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "content/new-vans");

export interface NewVanEntry {
  slug: string;
  title: string;
  make: string;
  model: string;
  heroImage: string | null;
  description: string;
  stockHref: string;
  wordCount: number;
}

export interface NewVanDetail extends NewVanEntry {
  body: string;
}

let _index: NewVanEntry[] | null = null;

export function getNewVanIndex(): NewVanEntry[] {
  if (_index) return _index;
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, "index.json"), "utf8");
    _index = JSON.parse(raw) as NewVanEntry[];
    return _index;
  } catch {
    return [];
  }
}

export function getNewVanBySlug(slug: string): NewVanDetail | null {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, `${slug}.json`), "utf8");
    return JSON.parse(raw) as NewVanDetail;
  } catch {
    return null;
  }
}

export function getNewVanSlugs(): string[] {
  try {
    return fs
      .readdirSync(DATA_DIR)
      .filter((f) => f.endsWith(".json") && f !== "index.json")
      .map((f) => f.replace(/\.json$/, ""));
  } catch {
    return [];
  }
}

export function groupByMake(entries: NewVanEntry[]): Record<string, NewVanEntry[]> {
  return entries.reduce<Record<string, NewVanEntry[]>>((acc, e) => {
    const m = e.make || "Other";
    if (!acc[m]) acc[m] = [];
    acc[m].push(e);
    return acc;
  }, {});
}
