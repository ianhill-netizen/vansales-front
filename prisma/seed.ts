import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PROVIDERS } from "../lib/integrations/providers";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Admin user
  const adminHash = await bcrypt.hash("ChangeMe123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@vansales.com" },
    update: {},
    create: {
      email: "admin@vansales.com",
      name: "Admin",
      passwordHash: adminHash,
      role: "admin",
    },
  });
  console.log("Admin user:", admin.email);

  // Swiss Vans dealer user + dealer record
  const svHash = await bcrypt.hash("ChangeMe123!", 12);
  const svUser = await prisma.user.upsert({
    where: { email: "dealer@swissvans.co.uk" },
    update: {},
    create: {
      email: "dealer@swissvans.co.uk",
      name: "Swiss Vans",
      passwordHash: svHash,
      role: "dealer",
    },
  });

  await prisma.dealer.upsert({
    where: { slug: "swiss-vans" },
    update: {},
    create: {
      slug: "swiss-vans",
      name: "Swiss Vans",
      location: "Bridgend",
      lat: 51.5045,
      lng: -3.5797,
      phone: "01656 507619",
      googleRating: 4.9,
      plan: "pro",
      ownerUserId: svUser.id,
    },
  });
  console.log("Swiss Vans dealer:", svUser.email);

  // Integration provider rows (upsert so re-running is safe)
  for (const p of PROVIDERS) {
    await prisma.integration.upsert({
      where: { provider: p.provider },
      update: {},
      create: {
        category: p.category,
        provider: p.provider,
        label: p.label,
        status: "untested",
      },
    });
  }
  console.log(`Seeded ${PROVIDERS.length} integration providers`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
