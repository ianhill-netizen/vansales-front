/**
 * A page title that never ends mid-word, carries the brand exactly once, and fits a 60-character total INCLUDING the brand suffix. The root layout (app/layout.tsx title.template "%s · Vansales")
 * appends " · Vansales" AFTER the page's own title, so the topic budget is 60 minus the suffix. Cut at the last word boundary that fits, then drop the punctuation a cut leaves behind
 * ("Land Rover Defender Commercial:" -> "Land Rover Defender Commercial"). A single word longer than the budget is kept whole rather than cut.
 *
 * Backend guide rows often bake a brand into meta_title ("... | Van Sales", "... | Vansales") and some were cut by the backend at 55 characters ("... Before You B | Van"): the brand variants
 * and the partial brand are stripped, and when the brand was CUT the topic before it was cut too, so its last (unreliable) word is dropped as well.
 */
export const TITLE_TOTAL_MAX = 60;

const TRAIL = /[\s:;,\-\u2013\u2014|&/(]+$/;

const SEP = String.raw`[|\u2013\u2014\u00b7-]`;
const BRAND_FULL = new RegExp(String.raw`\s*${SEP}\s*(?:van\s?sales|vansales(?:\.com?)?)\.?\s*$`, "i");
// "Van", "Van S", "Van Sa", "Van Sal", "Van Sale": the brand cut by a character limit
const BRAND_PARTIAL = new RegExp(String.raw`\s*${SEP}\s*van(?:\s(?:s(?:a(?:le?)?)?)?)?\s*$`, "i");
// a brand inside the title, after a separator and followed by more words ("... | vansales.com UK Guide")
const BRAND_MID = new RegExp(String.raw`(${SEP}\s*)(?:van\s?sales|vansales(?:\.com?)?)\.?\s+`, "i");

// The layout adds the brand, so a title that already names it renders it twice. Only a brand that follows a separator is removed ("Why Vansales Exists" is left alone).
export function stripBrand(title: string): string {
  return stripBrandInfo(title).title;
}

function stripBrandInfo(title: string): { title: string; cutBrand: boolean } {
  let t = title.trim();
  let cutBrand = false;
  for (let i = 0; i < 3; i++) {   // "... | Van Sales · Vansales"
    if (BRAND_FULL.test(t)) t = t.replace(BRAND_FULL, "");
    else if (BRAND_PARTIAL.test(t)) { t = t.replace(BRAND_PARTIAL, ""); cutBrand = true; }
    else break;
  }
  return { title: t.replace(BRAND_MID, "$1").trim(), cutBrand };
}

const DANGLING = /\s(a|an|the|of|to|for|and|or|in|on|with|your|you|is|are|what|how|before|which|that|this|these|those|from|by|at|as|be|can|should|must|it|its|our|my|we|i|their|every|each|about|into|than|but|if|when|where|who|why|will|do|does)$/i;

function trimDangling(t: string): string {
  let cut = t.replace(TRAIL, "");
  while (DANGLING.test(cut)) cut = cut.replace(/\s\S+$/, "").replace(TRAIL, "");
  return cut;
}

export function fitTitle(title: string, suffix = "", total = TITLE_TOTAL_MAX): string {
  const info = stripBrandInfo(title.replace(/\s+/g, " ").trim());
  let t = info.title;
  if (info.cutBrand) t = trimDangling(t.replace(/\s*\S+$/, "")) || t;   // the backend cut this title mid-way: its last word is a fragment ("You B")
  const budget = Math.max(10, total - suffix.length);
  if (t.length <= budget) return t;
  let out = "";
  for (const word of t.split(" ")) {
    const next = out ? `${out} ${word}` : word;
    if (next.replace(TRAIL, "").length > budget) break;   // measured without the punctuation a cut would drop
    out = next;
  }
  // a cut title should not end on a word that needs the next one ("... Van: A", "... Guide to")
  return trimDangling(out || t.split(" ")[0]) || t.split(" ")[0];
}
