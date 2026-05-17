"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { requireAdmin } from "@/lib/permissions";
import {
  createProduct,
  deleteProduct,
  PRODUCT_IN_ACTIVE_ORDER,
  PRODUCT_IN_CART,
  PRODUCT_NOT_FOUND,
  syncProductImages,
  PRODUCT_STATUS_LOCKED,
  updateProduct,
  updateProductStatus,
} from "@/server/services/admin-product.service";
import {
  saveProductImagesSchema,
  updateProductSchema,
  updateProductStatusSchema,
  upsertProductSchema,
} from "@/server/validators/admin-product";

function revalidateAdminProductPaths() {
  revalidatePath("/admin/tovary");
}

function revalidateStorefrontProduct(slug: string, categorySlug: string) {
  revalidatePath(`/tovar/${slug}`);
  revalidatePath(`/katalog/${categorySlug}`);
  revalidatePath("/katalog");
  revalidatePath("/");
}

function mapProductError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === PRODUCT_IN_CART) {
      return { ok: false as const, error: "PRODUCT_IN_CART" as const };
    }
    if (error.message === PRODUCT_IN_ACTIVE_ORDER) {
      return { ok: false as const, error: "PRODUCT_IN_ACTIVE_ORDER" as const };
    }
    if (error.message === PRODUCT_NOT_FOUND) {
      return { ok: false as const, error: "PRODUCT_NOT_FOUND" as const };
    }
    if (error.message === PRODUCT_STATUS_LOCKED) {
      return { ok: false as const, error: "PRODUCT_STATUS_LOCKED" as const };
    }
  }
  return { ok: false as const, error: "UNKNOWN" as const };
}

export async function updateProductStatusAction(input: unknown) {
  await requireAdmin();
  const data = updateProductStatusSchema.parse(input);

  try {
    const product = await updateProductStatus(data.productId, data.status);
    revalidateAdminProductPaths();
    revalidateStorefrontProduct(product.slug, product.category.slug);
    return { ok: true as const };
  } catch (error) {
    return mapProductError(error);
  }
}

export async function createProductAction(input: unknown) {
  await requireAdmin();
  const data = upsertProductSchema.parse(input);

  try {
    const product = await createProduct(data);
    revalidateAdminProductPaths();
    redirect(`/admin/tovary/${product.id}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return mapProductError(error);
  }
}

export async function updateProductAction(input: unknown) {
  await requireAdmin();
  const data = updateProductSchema.parse(input);

  try {
    const product = await updateProduct(data);
    revalidateAdminProductPaths();
    revalidateStorefrontProduct(product.slug, product.category.slug);
    return { ok: true as const };
  } catch (error) {
    return mapProductError(error);
  }
}

export async function saveProductImagesAction(input: unknown) {
  await requireAdmin();
  const data = saveProductImagesSchema.parse(input);

  try {
    const product = await syncProductImages(data.productId, data.images);
    if (!product) {
      return { ok: false as const, error: "PRODUCT_NOT_FOUND" as const };
    }
    revalidateAdminProductPaths();
    revalidateStorefrontProduct(product.slug, product.category.slug);
    return { ok: true as const };
  } catch (error) {
    return mapProductError(error);
  }
}

export async function deleteProductAction(id: string) {
  await requireAdmin();

  if (!id || typeof id !== "string") {
    return { ok: false as const, error: "UNKNOWN" as const };
  }

  try {
    await deleteProduct(id);
    revalidateAdminProductPaths();
    revalidatePath("/katalog");
    revalidatePath("/");
    redirect("/admin/tovary");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return mapProductError(error);
  }
}
