/** Structured page copy: sections of headings, paragraphs and lists. Inline links are written [text](/path). Pure data so tests can count words and check the rules. */
export type Block = { h3: string } | { p: string } | { ul: string[] };
export interface Section { id: string; h2: string; blocks: Block[] }

/** The visible words of some sections: link syntax reduced to its text. */
export function copyWords(sections: readonly Section[]): number {
  const text = sections.flatMap((s) => [s.h2, ...s.blocks.flatMap((b) => ("h3" in b ? [b.h3] : "p" in b ? [b.p] : b.ul))]).join(" ");
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").split(/\s+/).filter(Boolean).length;
}
