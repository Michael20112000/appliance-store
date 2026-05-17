import "dotenv/config";
import { categoryImageAlt } from "../src/lib/catalog/category-image-alt";
import { prisma } from "../src/lib/db";
import { ensureCategorySeedImage } from "./seed-cloudinary";

/**
 * Backfill category showcase images (null imagePublicId only) + standard alt text.
 * Run: npx tsx prisma/backfill-category-images.ts
 */
async function main() {
  const categories = await prisma.category.findMany({
    where: { imagePublicId: null },
    orderBy: { sortOrder: "asc" },
  });

  let updated = 0;
  for (const category of categories) {
    let publicId: string;
    try {
      publicId = await ensureCategorySeedImage(category.slug, 0);
    } catch (error) {
      console.warn(
        `Skip "${category.slug}":`,
        error instanceof Error ? error.message : error,
      );
      continue;
    }

    await prisma.category.update({
      where: { id: category.id },
      data: {
        imagePublicId: publicId,
        imageAlt: categoryImageAlt(category.name),
      },
    });
    updated += 1;
    console.log(`✓ ${category.name}`);
  }

  console.log(`Done. Updated ${updated}/${categories.length} categories.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
