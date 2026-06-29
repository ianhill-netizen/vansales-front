import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
}

export interface BlogPostDetail extends BlogPost {
  body: string;
  heroImage?: string;
  heroAlt?: string;
}

let _index: BlogPost[] | null = null;

export function getBlogIndex(): BlogPost[] {
  if (_index) return _index;
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, "index.json"), "utf8");
    _index = JSON.parse(raw) as BlogPost[];
    return _index;
  } catch {
    return [];
  }
}

export function getBlogPost(slug: string): BlogPostDetail | null {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, `${slug}.md`), "utf8");
    // Parse frontmatter
    const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return null;
    const meta: Record<string, string> = {};
    for (const line of match[1].split("\n")) {
      const m = line.match(/^(\w+):\s*"?([^"]*)"?\s*$/);
      if (m) meta[m[1]] = m[2].trim();
    }
    return {
      slug,
      title: meta.title || slug,
      date: meta.date || "",
      description: meta.excerpt || "",
      body: match[2].trim(),
      heroImage: meta.heroImage || undefined,
      heroAlt: meta.heroAlt || undefined,
    };
  } catch {
    return null;
  }
}

export function getBlogSlugs(): string[] {
  try {
    return fs
      .readdirSync(DATA_DIR)
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""));
  } catch {
    return [];
  }
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return iso.slice(0, 10);
  }
}
