/**
 * Pick `n` listings for a featured strip, at most one per seller, keeping the incoming order (newest first).
 * Only when the pool holds at least `n` distinct sellers; otherwise it is just the first `n`, i.e. what the strip showed before.
 */
export function spreadBySeller<T extends { seller: { name: string; type?: string } }>(pool: readonly T[], n: number): T[] {
  const key = (l: T) => `${l.seller.type ?? ""}:${l.seller.name.trim().toLowerCase()}`;
  const seen = new Set<string>();
  const picked: T[] = [];
  for (const l of pool) {
    const k = key(l);
    if (seen.has(k)) continue;
    seen.add(k);
    picked.push(l);
    if (picked.length === n) return picked;
  }
  return pool.slice(0, n);
}
