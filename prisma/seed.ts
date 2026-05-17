import "dotenv/config";
import slugify from "slugify";
import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/db";
import { categoryImageAlt } from "../src/lib/catalog/category-image-alt";
import { ensureCategorySeedImage } from "./seed-cloudinary";
import { seedProducts } from "./seed-products";

const categories = [
  { name: "Пральні машини", sortOrder: 1 },
  { name: "Холодильники", sortOrder: 2 },
  { name: "Морозильні камери", sortOrder: 3 },
  { name: "Телевізори", sortOrder: 4 },
  { name: "Плити", sortOrder: 5 },
  { name: "Духові шафи", sortOrder: 6 },
  { name: "Варильні поверхні", sortOrder: 7 },
  { name: "Сушарки для одягу", sortOrder: 8 },
] as const;

async function seedCategories() {
  for (const { name, sortOrder } of categories) {
    const slug = slugify(name, { lower: true, strict: true, locale: "uk" });
    await prisma.category.upsert({
      where: { slug },
      create: { name, slug, sortOrder },
      update: { name, sortOrder },
    });
  }
}

/** Sets imagePublicId from seed pool only when still null (D-10-12). */
async function seedCategoryShowcaseImages() {
  const categories = await prisma.category.findMany({
    where: { imagePublicId: null },
    orderBy: { sortOrder: "asc" },
  });

  for (const category of categories) {
    let publicId: string;
    try {
      publicId = await ensureCategorySeedImage(category.slug, 0);
    } catch (error) {
      console.warn(
        `Category image seed for "${category.slug}" failed:`,
        error instanceof Error ? error.message : error,
      );
      continue;
    }

    await prisma.category.updateMany({
      where: { id: category.id, imagePublicId: null },
      data: {
        imagePublicId: publicId,
        imageAlt: categoryImageAlt(category.name),
      },
    });
  }
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required for seed");
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (!existing) {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: "Адміністратор",
      },
    });
  }

  await prisma.user.update({
    where: { email },
    data: { role: "admin" },
  });
}

async function main() {
  await seedCategories();
  await seedCategoryShowcaseImages();
  await seedAdmin();
  await seedProducts();
  console.log(
    "Seed complete: categories + category images + admin + catalog products + Cloudinary images",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
