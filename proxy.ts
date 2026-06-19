import { NextRequest, NextResponse } from "next/server";

const PREVIEW_KEY = "vsp_0fj2k7mx";
const COOKIE_NAME = "vs_preview";
const HOLDING_PATH = "/coming-soon";

export function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Pass through: static assets, API routes, the holding page itself
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith(HOLDING_PATH)
  ) {
    return NextResponse.next();
  }

  // Gate is active only when COMING_SOON env is not explicitly "false"
  const gateActive = process.env.COMING_SOON !== "false";
  if (!gateActive) {
    return NextResponse.next();
  }

  // Bypass via ?preview=KEY — set cookie, redirect to same URL without param
  const previewParam = searchParams.get("preview");
  if (previewParam === PREVIEW_KEY) {
    const url = req.nextUrl.clone();
    url.searchParams.delete("preview");
    const res = NextResponse.redirect(url);
    res.cookies.set(COOKIE_NAME, PREVIEW_KEY, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    return res;
  }

  // Bypass via cookie
  if (req.cookies.get(COOKIE_NAME)?.value === PREVIEW_KEY) {
    return NextResponse.next();
  }

  // Rewrite to holding page (site stays built underneath, URL unchanged)
  const url = req.nextUrl.clone();
  url.pathname = HOLDING_PATH;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|api|coming-soon|favicon.ico).*)"],
};
