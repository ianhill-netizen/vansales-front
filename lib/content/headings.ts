/**
 * A page template owns the one <h1>. Article bodies (local markdown posts that start with "# Title", and backend guides) can carry their own: demote any <h1> in a body to <h2>, keeping its attributes,
 * so a page never renders two. Pure string work on trusted, already-sanitised HTML.
 */
export function demoteH1(html: string): string {
  return html.replace(/<h1(\s[^>]*)?>/gi, (_m, attrs) => `<h2${attrs ?? ""}>`).replace(/<\/h1\s*>/gi, "</h2>");
}

/** How many <h1> elements a piece of HTML has (used by tests). */
export function countH1(html: string): number {
  return (html.match(/<h1[\s>]/gi) ?? []).length;
}
