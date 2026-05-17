"use server";

import { revalidatePath } from "next/cache";
import { requireBuyer } from "@/lib/permissions";
import {
  addToWishlist,
  removeFromWishlist,
  resolveProductsByIds,
} from "@/server/services/wishlist.service";
import {
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
  } catch {
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
