"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { requireAdmin } from "@/lib/permissions";
import {
  CATEGORY_HAS_PRODUCTS,
  CATEGORY_NOT_FOUND,
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/server/services/admin-catalog.service";
import {
  updateCategorySchema,
  upsertCategorySchema,
} from "@/server/validators/category";

function revalidateCategoryPaths(slug?: string) {
  revalidatePath("/admin/kategorii");
  revalidatePath("/katalog");
  if (slug) {
    revalidatePath(`/katalog/${slug}`);
  }
}

function mapCategoryError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === CATEGORY_HAS_PRODUCTS) {
      return { ok: false as const, error: "CATEGORY_HAS_PRODUCTS" as const };
    }
    if (error.message === CATEGORY_NOT_FOUND) {
      return { ok: false as const, error: "CATEGORY_NOT_FOUND" as const };
    }
  }
  return { ok: false as const, error: "UNKNOWN" as const };
}

export async function createCategoryAction(input: unknown) {
  await requireAdmin();
  const data = upsertCategorySchema.parse(input);

  try {
    const category = await createCategory(data);
    revalidateCategoryPaths(category.slug);
    redirect(`/admin/kategorii/${category.id}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return mapCategoryError(error);
  }
}

export async function updateCategoryAction(input: unknown) {
  await requireAdmin();
  const data = updateCategorySchema.parse(input);

  try {
    const category = await updateCategory(data);
    revalidateCategoryPaths(category.slug);
    return { ok: true as const };
  } catch (error) {
    return mapCategoryError(error);
  }
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();

  if (!id || typeof id !== "string") {
    return { ok: false as const, error: "UNKNOWN" as const };
  }

  try {
    await deleteCategory(id);
    revalidateCategoryPaths();
    redirect("/admin/kategorii");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return mapCategoryError(error);
  }
}
