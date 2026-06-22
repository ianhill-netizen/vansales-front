import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/dk-track
 *
 * Server-side proxy between the browser and the Dealski Events API.
 * DEALSKI_API_KEY and DEALSKI_API_URL are server-only env vars (no NEXT_PUBLIC_).
 * The browser never sees the key — it only talks to this route.
 *
 * Real visitor IP is forwarded in X-Forwarded-For so Dealski logs the
 * visitor's IP, not this Vercel server's IP.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const apiKey = process.env.DEALSKI_API_KEY;
  const apiUrl = process.env.DEALSKI_API_URL;

  // If not configured, acknowledge silently — tracking must never break pages.
  if (!apiKey || !apiUrl) {
    return new NextResponse(null, { status: 204 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  // Real visitor IP: x-forwarded-for first hop (set by Vercel/CDN), then x-real-ip.
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp =
    (forwardedFor ? forwardedFor.split(",")[0].trim() : null) ??
    request.headers.get("x-real-ip") ??
    "";

  try {
    const upstream = await fetch(`${apiUrl}/api/v1/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...(realIp ? { "X-Forwarded-For": realIp } : {}),
      },
      body: JSON.stringify({ ...body, source: "vansales" }),
    });

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.ok ? 201 : upstream.status });
  } catch (err) {
    console.error("[dk-track] Upstream error:", err);
    // Fail silently to the client — tracking must never break the page.
    return new NextResponse(null, { status: 204 });
  }
}
