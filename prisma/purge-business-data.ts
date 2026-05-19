/**
 * Purge all business data from PostgreSQL (catalog, carts, orders, chat).
 *
 * FK-safe delete order (single transaction):
 *   Message → Conversation → OrderItem → Order → CartItem → Cart →
 *   WishlistItem → ProductImage → Product → Category
 *
 * Auth tables are NEVER touched: User, Session, Account, Verification.
 *
 * Run: npm run db:purge
 * Confirm: CONFIRM_DB_PURGE=yes or --confirm
 * Production: also set ALLOW_PRODUCTION_PURGE=yes when intentional
 *
 * Cloudinary assets are NOT deleted (orphaned media may remain).
 * Optional refill: npx prisma db seed (separate step — not automatic).
 */
import "dotenv/config";
import { pathToFileURL } from "node:url";
import { prisma } from "../src/lib/db";

const isDirectRun =
  typeof process.argv[1] === "string" &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

const PURGE_STEPS = [
  { key: "Message", run: (tx: PurgeTx) => tx.message.deleteMany({}) },
  { key: "Conversation", run: (tx: PurgeTx) => tx.conversation.deleteMany({}) },
  { key: "OrderItem", run: (tx: PurgeTx) => tx.orderItem.deleteMany({}) },
  { key: "Order", run: (tx: PurgeTx) => tx.order.deleteMany({}) },
  { key: "CartItem", run: (tx: PurgeTx) => tx.cartItem.deleteMany({}) },
  { key: "Cart", run: (tx: PurgeTx) => tx.cart.deleteMany({}) },
  { key: "WishlistItem", run: (tx: PurgeTx) => tx.wishlistItem.deleteMany({}) },
  { key: "ProductImage", run: (tx: PurgeTx) => tx.productImage.deleteMany({}) },
  { key: "Product", run: (tx: PurgeTx) => tx.product.deleteMany({}) },
  { key: "Category", run: (tx: PurgeTx) => tx.category.deleteMany({}) },
] as const;

type PurgeTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export function isPurgeConfirmed(
  env: NodeJS.ProcessEnv = process.env,
  argv: string[] = process.argv,
): boolean {
  return argv.includes("--confirm") || env.CONFIRM_DB_PURGE === "yes";
}

export function isProductionPurgeAllowed(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (env.NODE_ENV !== "production") {
    return true;
  }
  return env.ALLOW_PRODUCTION_PURGE === "yes";
}

export function assertPurgeAllowed(
  env: NodeJS.ProcessEnv = process.env,
  argv: string[] = process.argv,
): void {
  if (!isPurgeConfirmed(env, argv)) {
    console.error(
      "Refusing purge: pass --confirm or set CONFIRM_DB_PURGE=yes",
    );
    process.exit(1);
  }

  if (!isProductionPurgeAllowed(env)) {
    console.error(
      "Refusing purge in production without ALLOW_PRODUCTION_PURGE=yes",
    );
    process.exit(1);
  }

  const nodeEnv = env.NODE_ENV ?? "development";
  const dbUrl = env.DATABASE_URL;
  const hostHint = dbUrl
    ? (() => {
        try {
          return new URL(dbUrl.replace(/^postgres:/, "postgresql:")).hostname;
        } catch {
          return "(unparseable)";
        }
      })()
    : "(unset)";
  console.log(`NODE_ENV=${nodeEnv} DATABASE_HOST=${hostHint}`);
}

export async function purgeBusinessData(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  await prisma.$transaction(async (tx) => {
    for (const step of PURGE_STEPS) {
      const result = await step.run(tx);
      counts[step.key] = result.count;
    }
  });

  return counts;
}

function printReport(counts: Record<string, number>): void {
  let total = 0;
  for (const step of PURGE_STEPS) {
    const count = counts[step.key] ?? 0;
    total += count;
    console.log(`${step.key}: ${count}`);
  }
  console.log(`Total deleted: ${total}`);
  console.log(
    "Cloudinary assets were NOT deleted. Orphaned media may remain.",
  );
}

async function main(): Promise<void> {
  assertPurgeAllowed();
  const counts = await purgeBusinessData();
  printReport(counts);
}

if (isDirectRun) {
  main()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
