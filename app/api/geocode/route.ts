import { NextRequest, NextResponse } from "next/server";

const DEALSKI_API = (
  process.env.DEALSKI_API_URL ?? "https://swissvans.dealski.co.uk"
).replace(/\/$/, "");
const MARKETPLACE_KEY = process.env.DEALSKI_MARKETPLACE_KEY ?? "";

export async function POST(req: NextRequest) {
  if (!MARKETPLACE_KEY) {
    return NextResponse.json({ error: "Geocoding not configured" }, { status: 503 });
  }

  let body: { postcode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const postcode = (body.postcode ?? "").trim();
  if (!postcode) {
    return NextResponse.json({ error: "postcode required" }, { status: 422 });
  }

  try {
    const upstream = await fetch(`${DEALSKI_API}/api/marketplace/geocode`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MARKETPLACE_KEY}`,
      },
      body: JSON.stringify({ postcode }),
    });

    const data = await upstream.json();

    if (upstream.status === 429) {
      return NextResponse.json(
        { error: "Distance search is temporarily unavailable — please try again later." },
        { status: 429 },
      );
    }

    if (!upstream.ok) {
      return NextResponse.json(
        { error: data?.error ?? "Geocode failed — check postcode" },
        { status: upstream.status },
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Geocode request failed" }, { status: 502 });
  }
}
