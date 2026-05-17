import slugify from "slugify";
import { prisma } from "@/lib/db";
import type { UpsertCategoryValues } from "@/server/validators/category";

export const CATEGORY_HAS_PRODUCTS = "CATEGORY_HAS_PRODUCTS";
export const SLUG_ALREADY_EXISTS = "SLUG_ALREADY_EXISTS";
export const CATEGORY_NOT_FOUND = "CATEGORY_NOT_FOUND";

export function slugFromName(name: string): string {
  return slugify(name, { lower: true, strict: true, locale: "uk" });
}

export function appendSlugSuffix(base: string, suffix: number): string {
  return suffix <= 1 ? base : `${base}-${suffix}`;
}

export function assertCategoryDeletable(productCount: number): void {
  if (productCount > 0) {
    throw new Error(CATEGORY_HAS_PRODUCTS);
  }
}

async function resolveUniqueSlug(
  baseSlug: string,
  excludeId?: string,
): Promise<string> {
  let suffix = 1;
  let candidate = baseSlug;

  while (true) {
    const existing = await prisma.category.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) {
      return candidate;
    }
    suffix += 1;
    candidate = appendSlugSuffix(baseSlug, suffix);
  }
}

export async function listCategoriesAdmin() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      _count: { select: { products: true } },
    },
  });
}

export async function createCategory(data: UpsertCategoryValues) {
  const baseSlug = data.slug?.trim() || slugFromName(data.name);
  const slug = await resolveUniqueSlug(baseSlug);

  return prisma.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description ?? null,
      sortOrder: data.sortOrder,
    },
  });
}

export async function updateCategory(
  input: UpsertCategoryValues & { id: string },
) {
  const existing = await prisma.category.findUnique({ where: { id: input.id } });
  if (!existing) {
    throw new Error(CATEGORY_NOT_FOUND);
  }

  let slug = existing.slug;
  if (input.slug?.trim()) {
    slug = await resolveUniqueSlug(input.slug.trim(), input.id);
  }

  return prisma.category.update({
    where: { id: input.id },
    data: {
      name: input.name,
      slug,
      description: input.description ?? null,
      sortOrder: input.sortOrder,
    },
  });
}

export async function deleteCategory(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });

  if (!category) {
    throw new Error(CATEGORY_NOT_FOUND);
  }

  assertCategoryDeletable(category._count.products);

  await prisma.category.delete({ where: { id } });
}
