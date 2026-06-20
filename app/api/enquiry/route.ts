import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sourceIdFromSlug } from "@/lib/listings/slug";

/* Per-instance rate limit: max 5 submissions per IP per 15 min.
   Serverless means this resets on cold starts — good enough for a contact form. */
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

const DEALSKI_LEADS_URL = "https://swissvans.dealski.co.uk/api/leads/website";

export async function POST(req: Request) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (rateCheck(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests — please try again later or call us." },
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
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name || name.length < 2) {
    return NextResponse.json({ ok: false, error: "Please enter your full name." }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  }
  if (!phone || phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json({ ok: false, error: "Please enter a valid phone number." }, { status: 400 });
  }

  const make = String(body.make ?? "").trim();
  const model = String(body.model ?? "").trim();
  const derivative = String(body.derivative ?? "").trim();
  const slug = String(body.slug ?? "").trim();
  const location = String(body.location ?? "").trim();

  const vehicleRef = [make, model, derivative].filter(Boolean).join(" ");

  const notes = [
    message || `Hi, I'm interested in the ${vehicleRef}. Is it still available?`,
    "",
    vehicleRef ? `Vehicle: ${vehicleRef}` : "",
    location ? `Location: ${location}` : "",
    slug ? `Ref: ${slug}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  // If the slug resolves to a native listing in our DB, save locally and skip Dealski.
  if (slug) {
    const potentialId = sourceIdFromSlug(slug);
    const nativeListing = await prisma.listing.findUnique({
      where: { id: potentialId },
      select: { id: true, source: true },
    }).catch(() => null);

    if (nativeListing?.source === "native") {
      try {
        await prisma.enquiry.create({
          data: {
            listingRef: nativeListing.id,
            name,
            contact: email,
            channel: "Web",
            message: notes,
          },
        });
      } catch (err) {
        console.error("[enquiry] Failed to save native enquiry:", err);
      }
      return NextResponse.json({ ok: true });
    }
  }

  try {
    const res = await fetch(DEALSKI_LEADS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name,
        email,
        mobile: phone || undefined,
        source: "vansales",
        notes,
        vehicle_ref: vehicleRef || undefined,
        page_url: slug ? `https://vansales.com/listing/${slug}` : "https://vansales.com",
        page_name: vehicleRef ? `Van listing — ${vehicleRef}` : "Vansales",
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[enquiry] Dealski ${res.status}:`, text.slice(0, 200));
      return NextResponse.json(
        { ok: false, error: "Could not submit — please call us on 01656 507619." },
        { status: 502 },
      );
    }

    const data = (await res.json().catch(() => ({}))) as { lead_id?: number };
    return NextResponse.json({ ok: true, leadId: data.lead_id });
  } catch (err) {
    console.error("[enquiry] fetch failed:", err);
    return NextResponse.json(
      { ok: false, error: "Network error — please call us on 01656 507619." },
      { status: 502 },
    );
  }
}
