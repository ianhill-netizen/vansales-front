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

// Fallback for non-marketplace Dealski listings (dealski source without an enquiry_url).
const DEALSKI_LEADS_FALLBACK = "https://swissvans.dealski.co.uk/api/leads/website";

// SSRF guard: only forward to known Dealski tenant lead endpoints.
const ALLOWED_ENQUIRY_URL = /^https:\/\/[a-z0-9][a-z0-9-]*\.dealski\.co\.uk\/api\/leads\/website$/;

function validateEnquiryUrl(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw) return null;
  return ALLOWED_ENQUIRY_URL.test(raw) ? raw : null;
}

function splitName(full: string): { first_name: string; last_name: string } {
  const parts = full.trim().split(/\s+/);
  return {
    first_name: parts[0] ?? "",
    last_name: parts.slice(1).join(" "),
  };
}

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
  // vehicle_ref carries enquiry_route.ref (customer_ref or source_id from the marketplace)
  const vehicleRef = String(body.vehicle_ref ?? [make, model, derivative].filter(Boolean).join(" ")).trim();

  // enquiry_url is set only for marketplace listings; validated server-side.
  const enquiryUrl = validateEnquiryUrl(body.enquiry_url);

  // UTM params forwarded from the listing page URL
  const utms: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const v = body[key];
    if (typeof v === "string" && v) utms[key] = v;
  }

  const vehicleLabel = [make, model, derivative].filter(Boolean).join(" ");
  const notes = [
    message || `Hi, I'm interested in the ${vehicleLabel || "van"}. Is it still available?`,
    "",
    vehicleLabel ? `Vehicle: ${vehicleLabel}` : "",
    vehicleRef && vehicleRef !== vehicleLabel ? `Ref: ${vehicleRef}` : "",
    location ? `Location: ${location}` : "",
    slug ? `Listing: https://vansales.com/listing/${slug}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  // Native DB listings: save locally and bypass Dealski entirely.
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

  // Marketplace and Dealski listings forward to the dealer's Dealski inbox.
  // Marketplace listings supply a per-tenant enquiry_url; Dealski-source listings
  // fall back to the SwissVans URL (single tenant, no enquiry_url set).
  const forwardUrl = enquiryUrl ?? DEALSKI_LEADS_FALLBACK;
  const { first_name, last_name } = splitName(name);
  const pageUrl = slug ? `https://vansales.com/listing/${slug}` : "https://vansales.com";

  const payload = {
    first_name,
    last_name,
    name,
    email,
    mobile: phone || undefined,
    source: "vansales",
    notes,
    vehicle_ref: vehicleRef || undefined,
    page_url: pageUrl,
    page_name: vehicleLabel ? `Van listing — ${vehicleLabel}` : "Vansales",
    ...utms,
  };

  try {
    const res = await fetch(forwardUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[enquiry] Forward ${res.status} to ${forwardUrl}:`, text.slice(0, 200));
      // Log full lead so it's never lost even if the downstream is unavailable.
      console.error("[enquiry] LEAD_FALLBACK", JSON.stringify({ ...payload, forward_url: forwardUrl }));
      return NextResponse.json(
        { ok: false, error: "Could not submit — please call us on 01656 507619." },
        { status: 502 },
      );
    }

    const data = (await res.json().catch(() => ({}))) as { lead_id?: number };
    return NextResponse.json({ ok: true, leadId: data.lead_id });
  } catch (err) {
    console.error("[enquiry] fetch failed:", err);
    console.error("[enquiry] LEAD_FALLBACK", JSON.stringify({ ...payload, forward_url: forwardUrl }));
    return NextResponse.json(
      { ok: false, error: "Network error — please call us on 01656 507619." },
      { status: 502 },
    );
  }
}
