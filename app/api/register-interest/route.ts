import { NextResponse } from "next/server";
import { headers } from "next/headers";

/* Rate limit: 5 submissions per IP per 15 min (same policy as /api/enquiry). */
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 5;
const ipMap = new Map<string, { count: number; resetAt: number }>();

function rateCheck(ip: string): boolean {
  const now = Date.now();
  const entry = ipMap.get(ip);
  if (!entry || now > entry.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_MAX) return true;
  entry.count++;
  return false;
}

function splitName(full: string): { first_name: string; last_name: string } {
  const parts = full.trim().split(/\s+/);
  return { first_name: parts[0] ?? "", last_name: parts.slice(1).join(" ") };
}

/* Forwards to the same Dealski leads endpoint used by /api/enquiry.
   Payload shape: { first_name, last_name, name, email, source, notes, page_url, page_name }
   Endpoint: POST https://swissvans.dealski.co.uk/api/leads/website */
const DEALSKI_LEADS_URL = "https://swissvans.dealski.co.uk/api/leads/website";

export async function POST(req: Request) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (rateCheck(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests — please try again later." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot — silently accept bots
  if (body.website) return NextResponse.json({ ok: true });

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();
  const rawType = body.enquiry_type;
  const enquiryType: "retail" | "trade" | null =
    rawType === "retail" || rawType === "trade" ? rawType : null;

  if (!name || name.length < 2) {
    return NextResponse.json(
      { ok: false, error: "Please enter your full name." },
      { status: 400 },
    );
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 },
    );
  }
  if (!enquiryType) {
    return NextResponse.json(
      { ok: false, error: "Please select whether you're retail or trade." },
      { status: 400 },
    );
  }

  const { first_name, last_name } = splitName(name);
  const enquiryLabel = enquiryType === "retail" ? "Retail (buying a van)" : "Trade (dealer)";
  const notes = [
    `Enquiry type: ${enquiryLabel}`,
    message || "Registered interest via vansales.com opening banner.",
  ].join("\n");

  const payload = {
    first_name,
    last_name,
    name,
    email,
    source: "vansales-register-interest",
    enquiry_type: enquiryType,
    notes,
    page_url: "https://vansales.com",
    page_name: "Register Interest — Opening August 2026",
  };

  try {
    const res = await fetch(DEALSKI_LEADS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[register-interest] Dealski ${res.status}:`, text.slice(0, 200));
      // Log full lead so no submission is lost if Dealski is temporarily down.
      console.error("[register-interest] LEAD_FALLBACK", JSON.stringify(payload));
      return NextResponse.json(
        { ok: false, error: "Could not submit — please call us on 01656 507619." },
        { status: 502 },
      );
    }

    const data = (await res.json().catch(() => ({}))) as { lead_id?: number };
    return NextResponse.json({ ok: true, leadId: data.lead_id });
  } catch (err) {
    console.error("[register-interest] fetch failed:", err);
    console.error("[register-interest] LEAD_FALLBACK", JSON.stringify(payload));
    return NextResponse.json(
      { ok: false, error: "Network error — please call us on 01656 507619." },
      { status: 502 },
    );
  }
}
