import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email: string;
    password: string;
    name?: string;
    role?: "customer" | "dealer";
    dealerName?: string;
  };

  const { email, password, name, role = "customer", dealerName } = body;

  if (!email || !password) {
    return Response.json({ error: "Email and password are required." }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      name: name ?? null,
      passwordHash,
      role,
    },
  });

  // Auto-create a dealer record if signing up as dealer
  if (role === "dealer" && dealerName) {
    const slug = dealerName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    await prisma.dealer.create({
      data: {
        slug: slug || `dealer-${user.id.slice(-6)}`,
        name: dealerName,
        plan: "basic",
        ownerUserId: user.id,
      },
    });
  }

  return Response.json({ ok: true, userId: user.id });
}
