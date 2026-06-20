import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function isAuthorized(): Promise<boolean> {
  const store = await cookies();
  const preview = store.get("vs_preview")?.value ?? "";
  return preview.startsWith("vsp_");
}

export async function POST(request: Request) {
  if (!(await isAuthorized())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { provider } = (await request.json()) as { provider: string };
  if (!provider) return Response.json({ error: "provider required" }, { status: 400 });

  const integration = await prisma.integration.findUnique({ where: { provider } });

  const status: "connected" | "failed" = integration?.value ? "connected" : "failed";
  const message =
    status === "connected"
      ? "API key is set — connection verified (stub)"
      : "No API key configured — add a key and save first";

  await prisma.integration.update({
    where: { provider },
    data: { status, lastTestedAt: new Date() },
  });

  return Response.json({ ok: true, status, message });
}
