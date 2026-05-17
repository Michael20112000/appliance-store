import slugify from "slugify";
import type { ProductCondition, ProductStatus } from "../src/generated/prisma/client";
import { HERO_PUBLIC_ID } from "../src/lib/demo-assets";
import { prisma } from "../src/lib/db";

const BRANDS = ["Samsung", "Bosch", "LG", "Indesit", "Whirlpool", "Electrolux"] as const;
const CONDITIONS: ProductCondition[] = ["LIKE_NEW", "GOOD", "FAIR"];

function imagePublicId(index: number): string {
  const fromEnv = process.env.SEED_CLOUDINARY_PUBLIC_IDS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (fromEnv?.length) {
    return fromEnv[index % fromEnv.length]!;
  }
  return HERO_PUBLIC_ID;
}

function uahToKopiyky(uah: number): number {
  return Math.round(uah * 100);
}

type SeedProduct = {
  title: string;
  brand: string;
  priceUah: number;
  condition: ProductCondition;
  status: ProductStatus;
  categorySlug: string;
  description: string;
};

function buildProductsForCategory(
  categorySlug: string,
  categoryName: string,
  startIndex: number,
): SeedProduct[] {
  const items: SeedProduct[] = [];
  for (let i = 0; i < 4; i++) {
    const n = startIndex + i;
    const brand = BRANDS[n % BRANDS.length]!;
    items.push({
      title: `${brand} ${categoryName} ${n + 1}`,
      brand,
      priceUah: 2500 + n * 750 + (i % 3) * 500,
      condition: CONDITIONS[i % CONDITIONS.length]!,
      status: "AVAILABLE",
      categorySlug,
      description: `Б/у ${categoryName.toLowerCase()} у відмінному стані. Перевірено в магазині у Львові. Модель ${n + 1}.`,
    });
  }
  return items;
}

export async function seedProducts() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const catalog: SeedProduct[] = [];
  categories.forEach((cat, idx) => {
    catalog.push(...buildProductsForCategory(cat.slug, cat.name, idx * 4));
  });

  if (categories[0]) {
    catalog.push({
      title: "Samsung Холодильник SOLD demo",
      brand: "Samsung",
      priceUah: 8900,
      condition: "GOOD",
      status: "SOLD",
      categorySlug: categories[0].slug,
      description: "Проданий товар для тестів CAT-07.",
    });
    catalog.push({
      title: "Bosch Холодильник SOLD demo 2",
      brand: "Bosch",
      priceUah: 7200,
      condition: "FAIR",
      status: "SOLD",
      categorySlug: categories[0].slug,
      description: "Другий проданий товар для тестів.",
    });
    catalog.push({
      title: "LG Холодильник DRAFT demo",
      brand: "LG",
      priceUah: 6500,
      condition: "LIKE_NEW",
      status: "DRAFT",
      categorySlug: categories[0].slug,
      description: "Чернетка — не показується в публічному каталозі.",
    });
  }

  let imageIndex = 0;
  for (const item of catalog) {
    const category = categories.find((c) => c.slug === item.categorySlug);
    if (!category) continue;

    const baseSlug = slugify(item.title, {
      lower: true,
      strict: true,
      locale: "uk",
    });
    const slug = `${baseSlug}-${item.status.toLowerCase()}`;

    const product = await prisma.product.upsert({
      where: { slug },
      create: {
        title: item.title,
        slug,
        description: item.description,
        brand: item.brand,
        price: uahToKopiyky(item.priceUah),
        condition: item.condition,
        status: item.status,
        categoryId: category.id,
        images: {
          create: {
            cloudinaryPublicId: imagePublicId(imageIndex++),
            alt: `${item.title} — ${item.brand}, б/у, Львів`,
            sortOrder: 0,
          },
        },
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

    const publicId = imagePublicId(imageIndex);
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.create({
      data: {
        productId: product.id,
        cloudinaryPublicId: publicId,
        alt: `${item.title} — ${item.brand}, б/у, Львів`,
        sortOrder: 0,
      },
    });
    imageIndex++;
  }
}
