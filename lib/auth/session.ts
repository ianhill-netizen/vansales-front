import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Dealer } from "@prisma/client";

export async function getSessionDealer(): Promise<Dealer | null> {
  const session = await auth();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return null;
  return prisma.dealer.findUnique({ where: { ownerUserId: userId } });
}

export async function getSessionUserId(): Promise<string | null> {
  const session = await auth();
  return (session?.user?.id as string | undefined) ?? null;
}

export async function getSessionRole(): Promise<string | null> {
  const session = await auth();
  return ((session?.user as { role?: string } | undefined)?.role) ?? null;
}
