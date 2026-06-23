/* Deterministic FNV-1a 32-bit hash → stable 4-hex supplier code.
   Same input always produces the same code; no async/crypto needed. */
function fnv1a32(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (Math.imul(h, 0x01000193) >>> 0);
  }
  return h;
}

/** Maps a raw supplier name to a stable, opaque display code, e.g. "VS-7A3F". */
export function supplierCode(supplierName: string): string {
  const h = fnv1a32(supplierName.trim().toLowerCase());
  return "VS-" + h.toString(16).padStart(8, "0").slice(0, 4).toUpperCase();
}
