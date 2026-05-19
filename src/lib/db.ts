import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** Delegates added in phase 26 — stale dev singletons omit them after `prisma generate`. */
const REQUIRED_DELEGATES = ["storePhone", "storeEmail", "storeAddress"] as const;

function isPrismaClientCurrent(client: PrismaClient): boolean {
  return REQUIRED_DELEGATES.every((key) => key in client);
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

function getPrismaClient(): PrismaClient {
  const existing = globalForPrisma.prisma;
  if (existing && isPrismaClientCurrent(existing)) {
    return existing;
  }
  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = getPrismaClient();
