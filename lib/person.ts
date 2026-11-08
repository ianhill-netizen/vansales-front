"use client";

/**
 * The buyer's session on this device. A gated action (enquiry, test drive, PX) that creates the person's account hands back {session:{token,user}}; it is kept here so the person is "logged in" without ever having signed up:
 * later requests send it as a bearer token (the API then uses the account instead of asking for the details again) and "Sell your van" hands it over to the seller portal as a one-time link, so they arrive signed in there.
 * A person whose account already existed gets no token from a gated action: they sign in with an emailed link (/signin) or their password.
 */
const KEY = "vansales:session";
const API = (process.env.NEXT_PUBLIC_VANSALES_API_URL || "https://api.vansales.com").replace(/\/$/, "");

export interface PersonSession { token: string; user: { id: number; name?: string | null; first_name?: string | null; last_name?: string | null; email?: string | null } }

export function getSession(): PersonSession | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    return v && typeof v.token === "string" ? (v as PersonSession) : null;
  } catch { return null; }
}

/** Keep a session the API just handed back (ignored when there is none), and mirror the saved vans into the account. */
export function keepSession(s: unknown): void {
  const v = s as PersonSession | null | undefined;
  if (!v || typeof v.token !== "string") return;
  try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { return; }
  void syncSaved(v.token);
}

export function clearSession(): void { try { localStorage.removeItem(KEY); } catch {} }

export function authHeaders(): Record<string, string> {
  const s = getSession();
  return s ? { Authorization: `Bearer ${s.token}` } : {};
}

async function syncSaved(token: string): Promise<void> {
  try {
    const ids = (JSON.parse(localStorage.getItem("vansales:saved") || "[]") as string[]).filter((x) => /^\d+$/.test(x));
    if (!ids.length) return;
    await fetch(`${API}/api/private/saved/sync`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ ids }) });
  } catch {}
}

/** The URL to open for the seller portal: a one-time handoff link when this device has a session (so they arrive signed in), else the plain address. A dead session is dropped. */
export async function sellerUrl(base: string): Promise<string> {
  const s = getSession();
  if (!s) return base;
  try {
    const r = await fetch(`${API}/api/auth/handoff`, { method: "POST", headers: { Accept: "application/json", Authorization: `Bearer ${s.token}` } });
    if (r.status === 401) { clearSession(); return base; }
    const b = (await r.json().catch(() => ({}))) as { url?: string };
    return r.ok && b.url ? b.url : base;
  } catch { return base; }
}
