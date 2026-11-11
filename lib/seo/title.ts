/**
 * A page title that never ends mid-word. The root layout appends a suffix (" · Vansales") AFTER the page's own title, so the budget is the total rendered length minus that suffix.
 * Cut at the last word boundary that fits, then drop the punctuation a cut leaves behind ("Land Rover Defender Commercial:" -> "Land Rover Defender Commercial"). A single word longer than
 * the budget is kept whole rather than cut.
 */
export const TITLE_TOTAL_MAX = 70;

const TRAIL = /[\s:;,\-\u2013\u2014|&/(]+$/;

export function fitTitle(title: string, suffix = "", total = TITLE_TOTAL_MAX): string {
  const t = title.replace(/\s+/g, " ").trim();
  const budget = Math.max(10, total - suffix.length);
  if (t.length <= budget) return t;
  let out = "";
  for (const word of t.split(" ")) {
    const next = out ? `${out} ${word}` : word;
    if (next.replace(TRAIL, "").length > budget) break;   // measured without the punctuation a cut would drop
    out = next;
  }
  let cut = (out || t.split(" ")[0]).replace(TRAIL, "");
  // a cut title should not end on a word that needs the next one ("... Van: A", "... Guide to")
  while (/\s(a|an|the|of|to|for|and|or|in|on|with|your|you|is|are|what|how)$/i.test(cut)) cut = cut.replace(/\s\S+$/, "").replace(TRAIL, "");
  return cut || t.split(" ")[0];
}
