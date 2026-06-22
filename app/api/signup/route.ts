import { NextResponse } from "next/server";
import { headers } from "next/headers";

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

  const variant = body.variant;
  if (variant !== "retail" && variant !== "trade" && variant !== "advertise") {
    return NextResponse.json({ ok: false, error: "Invalid form type." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  let contactName: string;
  let source: string;
  let enquiry_type: string;
  let notes: string;
  let page_url: string;
  let page_name: string;

  if (variant === "retail") {
    const name = String(body.name ?? "").trim() || "Van Buyer";
    const looking_for = String(body.looking_for ?? "").trim();
    contactName = name;
    source = "vansales-signup-retail";
    enquiry_type = "retail";
    notes = [
      "Retail sign-up via vansales.com/signup/retail.",
      looking_for ? `Looking for: ${looking_for}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    page_url = "https://vansales.com/signup/retail";
    page_name = "Sign Up — Van Buyer";
  } else if (variant === "trade") {
    const dealership = String(body.dealership ?? "").trim();
    const contact_name = String(body.contact_name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const stock_size = String(body.stock_size ?? "").trim();

    if (!dealership) {
      return NextResponse.json(
        { ok: false, error: "Please enter your dealership name." },
        { status: 400 },
      );
    }
    if (!contact_name || contact_name.length < 2) {
      return NextResponse.json(
        { ok: false, error: "Please enter your name." },
        { status: 400 },
      );
    }
    if (!phone) {
      return NextResponse.json(
        { ok: false, error: "Please enter your phone number." },
        { status: 400 },
      );
    }
    if (!stock_size) {
      return NextResponse.json(
        { ok: false, error: "Please select your stock size." },
        { status: 400 },
      );
    }

    contactName = contact_name;
    source = "vansales-signup-trade";
    enquiry_type = "trade";
    notes = [
      "Trade sign-up via vansales.com/signup/trade.",
      `Dealership: ${dealership}`,
      `Phone: ${phone}`,
      `Typical stock size: ${stock_size}`,
    ].join("\n");
    page_url = "https://vansales.com/signup/trade";
    page_name = "Sign Up — Dealer / Trade";
  } else {
    // advertise
    const company = String(body.company ?? "").trim();
    const contact_name = String(body.contact_name ?? "").trim();
    const advertise_category = String(body.advertise_category ?? "").trim();

    if (!company) {
      return NextResponse.json(
        { ok: false, error: "Please enter your company name." },
        { status: 400 },
      );
    }
    if (!contact_name || contact_name.length < 2) {
      return NextResponse.json(
        { ok: false, error: "Please enter your name." },
        { status: 400 },
      );
    }
    if (!advertise_category) {
      return NextResponse.json(
        { ok: false, error: "Please select what you want to advertise." },
        { status: 400 },
      );
    }

    contactName = contact_name;
    source = "vansales-signup-advertise";
    enquiry_type = "advertiser";
    notes = [
      "Advertiser sign-up via vansales.com/signup/advertise.",
      `Company: ${company}`,
      `Advertising: ${advertise_category}`,
    ].join("\n");
    page_url = "https://vansales.com/signup/advertise";
    page_name = "Sign Up — Advertise";
  }

  const { first_name, last_name } = splitName(contactName);

  const payload = {
    first_name,
    last_name,
    name: contactName,
    email,
    source,
    enquiry_type,
    notes,
    page_url,
    page_name,
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
      console.error(`[signup] Dealski ${res.status}:`, text.slice(0, 200));
      console.error("[signup] LEAD_FALLBACK", JSON.stringify(payload));
      return NextResponse.json(
        { ok: false, error: "Could not submit — please call us on 01656 507619." },
        { status: 502 },
      );
    }

    const data = (await res.json().catch(() => ({}))) as { lead_id?: number };
    return NextResponse.json({ ok: true, leadId: data.lead_id });
  } catch (err) {
    console.error("[signup] fetch failed:", err);
    console.error("[signup] LEAD_FALLBACK", JSON.stringify(payload));
    return NextResponse.json(
      { ok: false, error: "Network error — please call us on 01656 507619." },
      { status: 502 },
    );
  }
}
