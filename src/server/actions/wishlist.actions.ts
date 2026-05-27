"use server";

import { revalidatePath } from "next/cache";
import { requireBuyer } from "@/lib/permissions";
import {
  addToWishlist,
  clearWishlistForUser,
  listWishlistForUser,
  mergePendingWishlistItems,
  removeFromWishlist,
  resolveProductsByIds,
  WISHLIST_MAX_ERROR,
} from "@/server/services/wishlist.service";
import type { WishlistViewDto } from "@/types/wishlist";
import {
  mergePendingWishlistSchema,
  resolveGuestWishlistSchema,
  wishlistProductIdSchema,
} from "@/server/validators/wishlist";

function revalidateWishlistPaths() {
  revalidatePath("/obrane");
  revalidatePath("/kabinet");
  revalidatePath("/", "layout");
}

export async function addToWishlistAction(productId: string) {
  const session = await requireBuyer();
  const parsed = wishlistProductIdSchema.parse({ productId });

  try {
    await addToWishlist(session.user.id, parsed.productId);
  } catch (error) {
    if (error instanceof Error && error.message === WISHLIST_MAX_ERROR) {
      return { ok: false as const, error: "WISHLIST_MAX" };
    }
    return { ok: false as const, error: "PRODUCT_UNAVAILABLE" };
  }

  revalidateWishlistPaths();
  return { ok: true as const };
}

export async function removeFromWishlistAction(productId: string) {
  const session = await requireBuyer();
  const parsed = wishlistProductIdSchema.parse({ productId });
  await removeFromWishlist(session.user.id, parsed.productId);
  revalidateWishlistPaths();
  return { ok: true as const };
}

export async function resolveGuestWishlistProductsAction(productIds: string[]) {
  const parsed = resolveGuestWishlistSchema.parse({ productIds });
  const lines = await resolveProductsByIds(parsed.productIds);
  return { ok: true as const, lines };
}

export async function clearWishlistAction() {
  const session = await requireBuyer();
  await clearWishlistForUser(session.user.id);
  revalidateWishlistPaths();
  return { ok: true as const };
}

export async function mergePendingWishlistAction(
  items: { productId: string }[],
) {
  const session = await requireBuyer();
  const parsed = mergePendingWishlistSchema.parse({ items });
  const result = await mergePendingWishlistItems(
    session.user.id,
    parsed.items,
  );
  revalidateWishlistPaths();
  return { ok: true as const, merged: result.merged };
}

export async function getWishlistAction(): Promise<WishlistViewDto> {
  const session = await requireBuyer();
  return listWishlistForUser(session.user.id);
}
