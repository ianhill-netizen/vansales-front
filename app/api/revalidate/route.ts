import { revalidateTag, revalidatePath } from "next/cache";
import { NextRequest } from "next/server";

const SECRET = process.env.REVALIDATE_SECRET ?? "";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  if (!SECRET || searchParams.get("secret") !== SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tag = searchParams.get("tag");
  const path = searchParams.get("path");

  if (!tag && !path) {
    return Response.json(
      { error: "Provide ?tag= or ?path=" },
      { status: 400 },
    );
  }

  const revalidated: string[] = [];

  if (tag) {
    revalidateTag(tag, "max");
    revalidated.push(`tag:${tag}`);
  }

  if (path) {
    revalidatePath(path);
    revalidated.push(`path:${path}`);
  }

  return Response.json({ revalidated, now: Date.now() });
}
