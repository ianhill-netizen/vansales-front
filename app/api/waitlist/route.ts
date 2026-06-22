import { NextResponse } from "next/server";
import { headers } from "next/headers";

const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 3;
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

  const email = String(body.email ?? "").trim();
  const buyerType = String(body.buyer_type ?? "buyer").trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const typeLabel = buyerType === "dealer" ? "Dealer / trade seller" : "Buyer";
  const notes = [
    `Vansales.com launch waitlist registration`,
    `Type: ${typeLabel}`,
    `Source: coming-soon holding page`,
  ].join("\n");

  try {
    const res = await fetch(DEALSKI_LEADS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: email.split("@")[0],
        email,
        source: "vansales-waitlist",
        notes,
        page_url: "https://vansales.com/",
        page_name: `Vansales — Opening August 2026`,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[waitlist] Dealski ${res.status}:`, text.slice(0, 200));
      return NextResponse.json(
        { ok: false, error: "Could not register — please email hello@vansales.com." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[waitlist] fetch failed:", err);
    return NextResponse.json(
      { ok: false, error: "Network error — please email hello@vansales.com." },
      { status: 502 },
    );
  }
}
