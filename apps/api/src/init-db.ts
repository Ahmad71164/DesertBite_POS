import { execSync } from "node:child_process";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { getApiRoot, getDatabaseUrl, DATABASE_FILE, setupDatabaseEnv } from "./db";
import { bootstrapDatabase, seedMenu } from "./seed-menu";

export { setupDatabaseEnv };

export async function initDatabase(prisma: PrismaClient) {
  setupDatabaseEnv();
  console.log(`Database file: ${DATABASE_FILE}`);

  try {
    await prisma.$connect();
    await bootstrapDatabase(prisma);
  } catch (err) {
    console.warn("Bootstrap failed — syncing schema...", (err as Error).message);
    execSync("npx prisma db push --accept-data-loss", {
      cwd: getApiRoot(),
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: getDatabaseUrl() },
    });
    await bootstrapDatabase(prisma);
  }

  const categoryCount = await prisma.category.count();
  if (categoryCount === 0) {
    console.log("Menu empty — seeding Desert Bite menu...");
    await seedMenu(prisma);
  }

  const [categories, items, users] = await Promise.all([
    prisma.category.count(),
    prisma.menuItem.count(),
    prisma.user.count(),
  ]);

  console.log(`Database ready: ${categories} categories, ${items} items, ${users} users`);
  return { categories, items, users };
}
