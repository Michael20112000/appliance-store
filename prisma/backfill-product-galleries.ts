import "dotenv/config";
import { seedProducts } from "./seed-products";

/**
 * Refresh product images (incl. multi-image galleries for selected slugs).
 * Run: npx tsx prisma/backfill-product-galleries.ts
 */
async function main() {
  await seedProducts();
  console.log("Product galleries updated.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    const { prisma } = await import("../src/lib/db");
    await prisma.$disconnect();
  });
