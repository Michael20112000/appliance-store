"use server";

import { revalidatePath } from "next/cache";
import { requireBuyer } from "@/lib/permissions";
import {
  addToCart,
  clearCart,
  getCartForUser,
  mergePendingItems,
  removeFromCart,
} from "@/server/services/cart.service";
import { resolveGuestCartProducts } from "@/server/services/cart.service";
import type { CartViewDto } from "@/types/cart";
import {
  addToCartSchema,
  mergePendingSchema,
  resolveGuestCartSchema,
} from "@/server/validators/cart";

function revalidateCartPaths() {
  revalidatePath("/koszyk");
  revalidatePath("/", "layout");
}

export async function addToCartAction(productId: string) {
  const session = await requireBuyer();
  const parsed = addToCartSchema.parse({ productId, quantity: 1 });

  try {
    await addToCart(session.user.id, parsed.productId);
  } catch {
    return { ok: false as const, error: "PRODUCT_UNAVAILABLE" };
  }

  revalidateCartPaths();
  return { ok: true as const };
}

export async function mergePendingCartAction(
  items: { productId: string }[],
) {
  const session = await requireBuyer();
  const parsed = mergePendingSchema.parse({ items });
  const result = await mergePendingItems(session.user.id, parsed.items);
  revalidateCartPaths();
  return { ok: true as const, merged: result.merged };
}

export async function removeFromCartAction(productId: string) {
  const session = await requireBuyer();
  const parsed = addToCartSchema.parse({ productId, quantity: 1 });
  await removeFromCart(session.user.id, parsed.productId);
  revalidateCartPaths();
  return { ok: true as const };
}

export async function clearCartAction() {
  const session = await requireBuyer();
  await clearCart(session.user.id);
  revalidateCartPaths();
  return { ok: true as const };
}

export async function resolveGuestCartAction(productIds: string[]) {
  const parsed = resolveGuestCartSchema.parse({ productIds });
  const cart = await resolveGuestCartProducts(parsed.productIds);
  return { ok: true as const, cart };
}

export async function getCartAction(): Promise<CartViewDto> {
  const session = await requireBuyer();
  return getCartForUser(session.user.id);
}
