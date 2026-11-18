/** Every form collects First name + Last name as two fields. The API routes read them with this helper, which also accepts the old single `name` (older cached pages) by splitting it on the first space. */
export function readPersonName(body: Record<string, unknown>, keys: { first?: string; last?: string; full?: string } = {}): { first_name: string; last_name: string; name: string } {
  const first = String(body[keys.first ?? "first_name"] ?? "").trim();
  const last = String(body[keys.last ?? "last_name"] ?? "").trim();
  if (first) return { first_name: first, last_name: last, name: `${first} ${last}`.trim() };
  const full = String(body[keys.full ?? "name"] ?? "").trim();
  const parts = full.split(/\s+/).filter(Boolean);
  return { first_name: parts[0] ?? "", last_name: parts.slice(1).join(" "), name: full };
}
