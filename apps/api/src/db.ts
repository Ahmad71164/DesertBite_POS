import path from "node:path";
import { fileURLToPath } from "node:url";

const getDirname = () => {
  try {
    if (typeof __dirname !== "undefined") return __dirname;
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    return process.cwd();
  }
};

const apiRoot = path.resolve(getDirname(), "..");
const dbFile = path.join(apiRoot, "prisma", "restaurant.db");

/** Absolute SQLite URL — avoids Windows/cwd path bugs */
export function getDatabaseUrl() {
  return `file:${dbFile.replace(/\\/g, "/")}`;
}

export function getApiRoot() {
  return apiRoot;
}

export const DATABASE_FILE = dbFile;

export function setupDatabaseEnv() {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = getDatabaseUrl();
  }
}
