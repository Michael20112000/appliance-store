import type { OrderStatus, Prisma } from "@/generated/prisma/client";

export const INSUFFICIENT_STOCK = "INSUFFICIENT_STOCK";

type OrderLineForInventory = {
  productId: string | null;
  quantity: number;
};

export function shouldReserveInventoryOnTransition(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  return from === "PENDING" && to === "CONFIRMED";
}

export function shouldReleaseInventoryOnTransition(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  return to === "CANCELLED" && from !== "PENDING" && from !== "CANCELLED";
}

function isPrismaRecordNotFound(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "P2025"
  );
}

export async function reserveProductUnitsForOrder(
  tx: Prisma.TransactionClient,
  items: OrderLineForInventory[],
): Promise<void> {
  for (const item of items) {
    if (item.productId == null || item.quantity < 1) {
      continue;
    }

    try {
      await tx.product.update({
        where: {
          id: item.productId,
          quantity: { gte: item.quantity },
        },
        data: {
          quantity: { decrement: item.quantity },
        },
      });
    } catch (error) {
      if (isPrismaRecordNotFound(error)) {
        throw new Error(INSUFFICIENT_STOCK);
      }
      throw error;
    }
  }
}

export async function releaseProductUnitsForOrder(
  tx: Prisma.TransactionClient,
  items: OrderLineForInventory[],
): Promise<void> {
  for (const item of items) {
    if (item.productId == null || item.quantity < 1) {
      continue;
    }

    await tx.product.update({
      where: { id: item.productId },
      data: {
        quantity: { increment: item.quantity },
      },
    });
  }
}

export async function assertProductsAvailableForCheckout(
  tx: Prisma.TransactionClient,
  productIds: string[],
): Promise<void> {
  for (const productId of productIds) {
    const product = await tx.product.findUnique({
      where: { id: productId },
      select: { quantity: true },
    });

    if (!product || product.quantity < 1) {
      throw new Error("PRODUCT_UNAVAILABLE");
    }
  }
}
