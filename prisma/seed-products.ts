import type { ProductStatus } from "../src/generated/prisma/client";
import { prisma } from "../src/lib/db";
import { ensureCategorySeedImage } from "./seed-cloudinary";
import { CATEGORY_CATALOG, DEMO_STATUS_PRODUCTS } from "./seed-catalog-data";

function uahToKopiyky(uah: number): number {
  return Math.round(uah * 100);
}

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

    let cloudinaryPublicId: string;
    try {
      cloudinaryPublicId = await ensureCategorySeedImage(item.categorySlug, indexInCategory);
    } catch (error) {
      console.warn(
        `Seed image for "${item.slug}" failed, skipping image update:`,
        error instanceof Error ? error.message : error,
      );
      cloudinaryPublicId = "";
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
        ...(cloudinaryPublicId
          ? {
              images: {
                create: {
                  cloudinaryPublicId,
                  alt: `${item.title} — ${item.brand}, б/у, Львів`,
                  sortOrder: 0,
                },
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

    if (cloudinaryPublicId) {
      await prisma.productImage.deleteMany({ where: { productId: product.id } });
      await prisma.productImage.create({
        data: {
          productId: product.id,
          cloudinaryPublicId,
          alt: `${item.title} — ${item.brand}, б/у, Львів`,
          sortOrder: 0,
        },
      });
    }
  }
}

export function countCatalogProducts(): { available: number; total: number } {
  const available = CATEGORY_CATALOG.reduce((n, c) => n + c.products.length, 0);
  return { available, total: available + DEMO_STATUS_PRODUCTS.length };
}
