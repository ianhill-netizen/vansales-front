import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrismaClient() {
  // Bounded on purpose: an unreachable database must fail in seconds, never hang a page render (or a build) for a minute. See lib/listings/client.ts.
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL!, connectionTimeoutMillis: 3000, idleTimeoutMillis: 30000, max: 5 });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
