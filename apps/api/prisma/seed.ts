import { PrismaClient } from "@prisma/client";
import { setupDatabaseEnv } from "../src/db";
import { initDatabase } from "../src/init-db";

setupDatabaseEnv();
const prisma = new PrismaClient();

initDatabase(prisma)
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
