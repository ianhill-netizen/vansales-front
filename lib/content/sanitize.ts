/**
 * Allow-list HTML sanitiser for guide bodies that arrive from vansales-backend (Mason publishes them). The backend already strips raw HTML from the markdown; this is the second line of defence on the
 * server before the HTML reaches dangerouslySetInnerHTML. Tags and attributes not on the lists are dropped; the contents of script/style/iframe/object/embed/svg/math/template/noscript are dropped with them.
 * No dependency: the input is split into tags and text, every tag is rebuilt from scratch, and every stray "<" in text is escaped.
 */

const ALLOWED = new Set(["p", "h2", "h3", "h4", "ul", "ol", "li", "strong", "b", "em", "i", "a", "blockquote", "br", "hr", "table", "thead", "tbody", "tr", "th", "td", "code", "pre", "sup", "sub", "figure", "figcaption"]);
const VOID = new Set(["br", "hr"]);
const DROP_WITH_CONTENT = new Set(["script", "style", "iframe", "object", "embed", "svg", "math", "template", "noscript", "form", "textarea", "select", "button"]);

const TAG = /<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
const COMMENT = /<!--[\s\S]*?-->/g;

/** A link target we are willing to render: http(s), mailto, or a path on this site. Anything else (javascript:, data:, vbscript:, protocol-relative) is refused. */
export function safeHref(raw: string): string | null {
  const v = raw.replace(/[\u0000- \u007f-\u009f]/g, "").trim();
  if (v === "") return null;
  if (v.startsWith("/") && !v.startsWith("//")) return raw.trim();
  if (v.startsWith("#")) return raw.trim();
  if (/^https?:\/\//i.test(v) || /^mailto:/i.test(v)) return raw.trim();
  return null;
}

/** An image URL we are willing to render: https only. */
export function safeImageUrl(raw: string | null | undefined): string | null {
  const v = (raw ?? "").trim();
  if (!/^https:\/\/[^\s"'<>]+$/i.test(v)) return null;
  try {
    return new URL(v).toString();
  } catch {
    return null;
  }
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function attr(attrs: string, name: string): string | null {
  const m = attrs.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, "i"));
  return m ? (m[1] ?? m[2] ?? m[3] ?? "") : null;
}

export function sanitizeGuideHtml(html: string): string {
  const src = html.replace(COMMENT, "");
  let out = "";
  let last = 0;
  let skipUntil: string | null = null; // inside a dropped element: the tag name whose close ends it
  let depth = 0;
  const open: string[] = [];
  const text = (s: string) => s.replace(/</g, "&lt;");
  TAG.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TAG.exec(src)) !== null) {
    const [whole, slash, rawName, attrs] = m;
    const name = rawName.toLowerCase();
    const between = src.slice(last, m.index);
    last = m.index + whole.length;
    if (skipUntil) {
      if (name === skipUntil) {
        if (slash) {
          depth--;
          if (depth === 0) skipUntil = null;
        } else {
          depth++;
        }
      }
      continue;
    }
    out += text(between);
    if (DROP_WITH_CONTENT.has(name)) {
      if (!slash) {
        skipUntil = name;
        depth = 1;
      }
      continue;
    }
    if (!ALLOWED.has(name)) continue; // unknown tag: drop the tag, keep its text
    if (slash) {
      const i = open.lastIndexOf(name);
      if (i !== -1) {
        // close anything left open inside it first, so the output is always balanced
        while (open.length > i) out += `</${open.pop()}>`;
      }
      continue;
    }
    if (name === "a") {
      const href = attr(attrs, "href");
      const safe = href === null ? null : safeHref(href);
      if (safe === null) {
        out += "<a>";
      } else {
        const external = /^https?:\/\//i.test(safe);
        out += `<a href="${escapeHtml(safe)}"${external ? ' rel="nofollow noopener noreferrer" target="_blank"' : ""} class="text-brand-700 hover:underline">`;
      }
      open.push("a");
      continue;
    }
    out += `<${name}>`;
    if (!VOID.has(name)) open.push(name);
  }
  if (!skipUntil) out += text(src.slice(last));
  while (open.length) out += `</${open.pop()}>`;
  return out;
}
