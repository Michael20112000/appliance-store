import type { ProductStatus } from "../src/generated/prisma/client";
import { prisma } from "../src/lib/db";
import { ensureCategorySeedImage } from "./seed-cloudinary";
import { CATEGORY_CATALOG, DEMO_STATUS_PRODUCTS } from "./seed-catalog-data";

function uahToKopiyky(uah: number): number {
  return Math.round(uah * 100);
}

/** Extra gallery images beyond the first (slug → additional image count). */
const PRODUCT_EXTRA_IMAGE_COUNT: Record<string, number> = {
  "iphone-se-2022-64": 3,
  "apple-iphone-12-64gb": 2,
  "apple-iphone-13-128gb": 2,
  "samsung-galaxy-s21-128": 2,
};

type SeedRow = {
  slug: string;
  title: string;
  brand: string;
  priceUah: number;
  condition: (typeof CATEGORY_CATALOG)[number]["products"][number]["condition"];
  status: ProductStatus;
  categorySlug: string;
  description: string;
};

/** Removes the previous generic 4-per-category seed batch. */
async function removeLegacySeedProducts() {
  const legacy = await prisma.product.findMany({
    where: {
      description: {
        contains: "Перевірено в магазині у Львові. Модель",
      },
    },
    select: { id: true },
  });
  if (legacy.length === 0) return;

  const ids = legacy.map((p) => p.id);
  await prisma.cartItem.deleteMany({ where: { productId: { in: ids } } });
  await prisma.product.deleteMany({ where: { id: { in: ids } } });
}

export async function seedProducts() {
  await removeLegacySeedProducts();

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

  const catalog: SeedRow[] = CATEGORY_CATALOG.flatMap(({ categorySlug, products }) =>
    products.map((p) => ({
      ...p,
      status: "AVAILABLE" as const,
      categorySlug,
    })),
  );

  for (const demo of DEMO_STATUS_PRODUCTS) {
    catalog.push({
      slug: demo.slug,
      title: demo.title,
      brand: demo.brand,
      priceUah: demo.priceUah,
      condition: demo.condition,
      status: demo.status,
      categorySlug: demo.categorySlug,
      description: demo.description,
    });
  }

  const catalogSlugs = catalog.map((item) => item.slug);
  await prisma.product.deleteMany({
    where: {
      slug: { notIn: catalogSlugs },
      status: { in: ["AVAILABLE", "DRAFT"] },
    },
  });

  const categoryProductIndex = new Map<string, number>();

  for (const item of catalog) {
    const category = categoryBySlug.get(item.categorySlug);
    if (!category) {
      console.warn(`Skip seed product "${item.slug}": unknown category ${item.categorySlug}`);
      continue;
    }

    const indexInCategory = categoryProductIndex.get(item.categorySlug) ?? 0;
    categoryProductIndex.set(item.categorySlug, indexInCategory + 1);

    const extraImages = PRODUCT_EXTRA_IMAGE_COUNT[item.slug] ?? 0;
    const imageCount = 1 + extraImages;
    const seededImages: { cloudinaryPublicId: string; alt: string; sortOrder: number }[] =
      [];

    for (let imageIndex = 0; imageIndex < imageCount; imageIndex += 1) {
      try {
        const cloudinaryPublicId = await ensureCategorySeedImage(
          item.categorySlug,
          indexInCategory + imageIndex,
        );
        seededImages.push({
          cloudinaryPublicId,
          alt: `${item.title} — ${item.brand}, б/у, Львів`,
          sortOrder: imageIndex,
        });
      } catch (error) {
        console.warn(
          `Seed image ${imageIndex} for "${item.slug}" failed:`,
          error instanceof Error ? error.message : error,
        );
      }
    }

    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      create: {
        title: item.title,
        slug: item.slug,
        description: item.description,
        brand: item.brand,
        price: uahToKopiyky(item.priceUah),
        condition: item.condition,
        status: item.status,
        categoryId: category.id,
        ...(seededImages.length > 0
          ? {
              images: {
                create: seededImages,
              },
            }
          : {}),
      },
      update: {
        title: item.title,
        description: item.description,
        brand: item.brand,
        price: uahToKopiyky(item.priceUah),
        condition: item.condition,
        status: item.status,
        categoryId: category.id,
      },
    });

    if (seededImages.length > 0) {
      await prisma.productImage.deleteMany({ where: { productId: product.id } });
      await prisma.productImage.createMany({
        data: seededImages.map((image) => ({
          productId: product.id,
          ...image,
        })),
      });
    }
  }
}

export function countCatalogProducts(): { available: number; total: number } {
  const available = CATEGORY_CATALOG.reduce((n, c) => n + c.products.length, 0);
  return { available, total: available + DEMO_STATUS_PRODUCTS.length };
}
