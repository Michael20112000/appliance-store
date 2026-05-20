import slugify from "slugify";
import {
  clampCategoryRank,
  insertCategoryAtRank,
  moveCategoryToRank,
  normalizeCategoryRanks,
  type CategoryRankRow,
} from "@/lib/admin/category-sort-order";
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

async function fetchCategoryRankRows(): Promise<CategoryRankRow[]> {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true, sortOrder: true },
  });
}

function displayRankById(rows: CategoryRankRow[]): Map<string, number> {
  return new Map(
    normalizeCategoryRanks(rows).map((row) => [row.id, row.sortOrder]),
  );
}

export async function listCategoriesAdmin() {
  const rankRows = await fetchCategoryRankRows();
  const ranks = displayRankById(rankRows);

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: {
      _count: { select: { products: true } },
    },
  });

  return categories.map((category) => ({
    ...category,
    sortOrder: ranks.get(category.id) ?? category.sortOrder,
  }));
}

export async function getCategoryCount(): Promise<number> {
  return prisma.category.count();
}

export async function getCategoryById(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: { select: { products: true } },
    },
  });
  if (!category) return null;

  const rankRows = await fetchCategoryRankRows();
  const ranks = displayRankById(rankRows);

  return {
    ...category,
    sortOrder: ranks.get(category.id) ?? category.sortOrder,
  };
}

export async function createCategory(data: UpsertCategoryValues) {
  const baseSlug = data.slug?.trim() || slugFromName(data.name);

  return prisma.$transaction(async (tx) => {
    const slug = await resolveUniqueSlug(baseSlug);
    const existing = await tx.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: { id: true, sortOrder: true },
    });
    const n = existing.length;
    const targetRank = clampCategoryRank(data.sortOrder, 1, n + 1);
    const placeholderId = "__new__";
    const ranked = insertCategoryAtRank(existing, placeholderId, targetRank);
    const newRow = ranked.find((row) => row.id === placeholderId);
    if (!newRow) {
      throw new Error("CATEGORY_RANK_FAILED");
    }

    for (const row of ranked) {
      if (row.id === placeholderId) continue;
      await tx.category.update({
        where: { id: row.id },
        data: { sortOrder: row.sortOrder },
      });
    }

    return tx.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description ?? null,
        sortOrder: newRow.sortOrder,
      },
    });
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

  const all = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true, sortOrder: true },
  });
  const n = all.length;
  const targetRank = clampCategoryRank(input.sortOrder, 1, n);
  const ranked = moveCategoryToRank(all, input.id, targetRank);

  return prisma.$transaction(async (tx) => {
    for (const row of ranked) {
      await tx.category.update({
        where: { id: row.id },
        data: {
          sortOrder: row.sortOrder,
          ...(row.id === input.id
            ? {
                name: input.name,
                slug,
                description: input.description ?? null,
              }
            : {}),
        },
      });
    }

    return tx.category.findUniqueOrThrow({ where: { id: input.id } });
  });
}

export async function updateCategoryImage(input: {
  categoryId: string;
  imagePublicId: string | null;
  imageAlt?: string | null;
}) {
  const existing = await prisma.category.findUnique({
    where: { id: input.categoryId },
    select: { id: true },
  });
  if (!existing) {
    throw new Error(CATEGORY_NOT_FOUND);
  }

  return prisma.category.update({
    where: { id: input.categoryId },
    data: {
      imagePublicId: input.imagePublicId,
      ...(input.imageAlt !== undefined ? { imageAlt: input.imageAlt } : {}),
    },
    select: { id: true, slug: true },
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

export async function reorderCategories(orderedIds: string[]): Promise<void> {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.category.update({
        where: { id },
        data: { sortOrder: index + 1 },
      })
    )
  );
}
