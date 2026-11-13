/** Pure HTML helpers for the generated guide bodies (no I/O, so node --test can import them). */
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#039;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();

/** The Q&A under the "Frequently asked questions" h2: each <h3> question followed by its <p> answer(s). */
export function parseFaq(html: string): { q: string; a: string }[] {
  const at = html.search(/<h2[^>]*>\s*Frequently asked questions\s*<\/h2>/i);
  if (at < 0) return [];
  const out: { q: string; a: string }[] = [];
  const parts = html.slice(at).split(/(?=<h3\b)/i).slice(1);
  for (const part of parts) {
    const q = text(part.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)?.[1] ?? "");
    const a = text(part.replace(/<h3[^>]*>[\s\S]*?<\/h3>/i, "").split(/<h2\b/i)[0]);
    if (q && a) out.push({ q, a });
  }
  return out;
}
