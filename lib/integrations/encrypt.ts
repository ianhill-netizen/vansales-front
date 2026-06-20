import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALG = "aes-256-gcm";
const SEP = ":";

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY ?? "";
  if (hex.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be exactly 64 hex chars (32 bytes)");
  }
  return Buffer.from(hex, "hex");
}

/** Encrypt a plaintext string → `iv:tag:ciphertext` (all hex). */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALG, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("hex"), tag.toString("hex"), encrypted.toString("hex")].join(SEP);
}

/** Decrypt a `iv:tag:ciphertext` hex string back to plaintext. */
export function decrypt(stored: string): string {
  const key = getKey();
  const parts = stored.split(SEP);
  if (parts.length !== 3) throw new Error("Invalid encrypted value format");
  const [ivHex, tagHex, encHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const enc = Buffer.from(encHex, "hex");
  const decipher = createDecipheriv(ALG, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

/** Return masked display value: ••••{last 4 chars}. Never throws. */
export function maskValue(stored: string): string {
  try {
    const raw = decrypt(stored);
    return raw.length <= 4 ? "••••" : `••••${raw.slice(-4)}`;
  } catch {
    return "••••";
  }
}
