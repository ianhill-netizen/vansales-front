import { NextResponse } from "next/server";
import { getMapsBrowserKey } from "@/lib/maps";

export async function GET() {
  const key = await getMapsBrowserKey();
  if (!key) {
    return NextResponse.json({ error: "Maps key not configured" }, { status: 404 });
  }
  return NextResponse.json({ key });
}
