/** Minimal safe markdown → HTML converter. Handles what the seed content uses. */
export function mdToHtml(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inUl = false;
  let inOl = false;

  const closeList = () => {
    if (inUl) { out.push("</ul>"); inUl = false; }
    if (inOl) { out.push("</ol>"); inOl = false; }
  };

  const inline = (s: string) => s
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    // External links → plain text (remove vansales.com internals, keep others)
    .replace(/\[([^\]]+)\]\(https?:\/\/(?:www\.)?vansales\.com[^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\(\/([^)]*)\)/g, '<a href="/$2" class="text-brand-700 hover:underline">$1</a>')
    .replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g, '<a href="#" class="text-brand-700 hover:underline">$1</a>')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();

    // Headings
    if (line.startsWith("#### ")) { closeList(); out.push(`<h4 class="mt-5 text-[var(--text-base)] font-bold text-ink-900">${inline(line.slice(5))}</h4>`); continue; }
    if (line.startsWith("### ")) { closeList(); out.push(`<h3 class="mt-6 font-display text-[var(--text-lg)] font-bold text-ink-900">${inline(line.slice(4))}</h3>`); continue; }
    if (line.startsWith("## ")) { closeList(); out.push(`<h2 class="mt-8 font-display text-[var(--text-xl)] font-bold text-ink-900">${inline(line.slice(3))}</h2>`); continue; }
    if (line.startsWith("# ")) { closeList(); out.push(`<h1 class="mt-4 font-display text-[var(--text-2xl)] font-bold text-ink-900">${inline(line.slice(2))}</h1>`); continue; }

    // Horizontal rule
    if (/^[-*]{3,}$/.test(line)) { closeList(); out.push('<hr class="my-6 border-border" />'); continue; }

    // Images
    if (line.startsWith("![")) {
      closeList();
      const m = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
      if (m) {
        const src = m[2].startsWith("/") ? m[2] : m[2];
        out.push(`<figure class="my-6"><img src="${src}" alt="${m[1]}" class="w-full rounded-[var(--radius-lg)] object-cover" loading="lazy" /></figure>`);
      }
      continue;
    }

    // Unordered list
    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (inOl) { out.push("</ol>"); inOl = false; }
      if (!inUl) { out.push('<ul class="my-3 space-y-1 pl-5">'); inUl = true; }
      out.push(`<li class="list-disc text-ink-700">${inline(line.slice(2))}</li>`);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      if (inUl) { out.push("</ul>"); inUl = false; }
      if (!inOl) { out.push('<ol class="my-3 space-y-1 pl-5 list-decimal">'); inOl = true; }
      out.push(`<li class="text-ink-700">${inline(line.replace(/^\d+\.\s/, ""))}</li>`);
      continue;
    }

    // Blank line
    if (line === "") {
      closeList();
      out.push("");
      continue;
    }

    // Block quote
    if (line.startsWith("> ")) {
      closeList();
      out.push(`<blockquote class="my-4 border-l-4 border-brand-400 pl-4 italic text-ink-600">${inline(line.slice(2))}</blockquote>`);
      continue;
    }

    // Paragraph
    closeList();
    out.push(`<p class="mt-4 leading-relaxed text-ink-700">${inline(line)}</p>`);
  }

  closeList();
  return out.join("\n");
}
