import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type { OrderDetailDto, OrderSummaryDto } from "@/types/order";
import type { CheckoutInput } from "../validators/order";
import { checkoutSchema } from "../validators/order";
import { clearCart, getCartForUser } from "./cart.service";

export async function listOrdersForUser(userId: string): Promise<OrderSummaryDto[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    deliveryType: order.deliveryType,
    totalKopiyky: order.items.reduce(
      (sum, item) => sum + item.priceSnapshot * item.quantity,
      0,
    ),
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: order.createdAt,
  }));
}

export async function getOrderForUser(
  userId: string,
  orderNumber: string,
): Promise<OrderDetailDto | null> {
  const order = await prisma.order.findFirst({
    where: { userId, orderNumber },
    include: { items: true },
  });

  if (!order) return null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    deliveryType: order.deliveryType,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    deliveryAddress: order.deliveryAddress,
    notes: order.notes,
    totalKopiyky: order.items.reduce(
      (sum, item) => sum + item.priceSnapshot * item.quantity,
      0,
    ),
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      titleSnapshot: item.titleSnapshot,
      priceSnapshot: item.priceSnapshot,
      quantity: item.quantity,
    })),
  };
}

export async function generateOrderNumber(
  tx: Prisma.TransactionClient,
): Promise<string> {
  const date = new Date();
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const prefix = `ASL-${y}${m}${d}-`;

  const latest = await tx.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });

  let next = 1;
  if (latest?.orderNumber) {
    const suffix = latest.orderNumber.slice(prefix.length);
    const parsed = Number.parseInt(suffix, 10);
    if (!Number.isNaN(parsed)) next = parsed + 1;
  }

  return `${prefix}${String(next).padStart(4, "0")}`;
}

function isPrismaRecordNotFound(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "P2025"
  );
}

export async function reserveProductUnitForCheckout(
  tx: Prisma.TransactionClient,
  productId: string,
): Promise<void> {
  let updated: { quantity: number };
  try {
    updated = await tx.product.update({
      where: {
        id: productId,
        status: "AVAILABLE",
        quantity: { gte: 1 },
      },
      data: { quantity: { decrement: 1 } },
      select: { quantity: true },
    });
  } catch (error) {
    if (isPrismaRecordNotFound(error)) {
      throw new Error("PRODUCT_UNAVAILABLE");
    }
    throw error;
  }

  if (updated.quantity === 0) {
    await tx.product.update({
      where: { id: productId },
      data: { status: "SOLD" },
    });
  }
}

export async function createOrderFromCart(
  userId: string,
  input: CheckoutInput,
): Promise<{ orderNumber: string }> {
  const data = checkoutSchema.parse(input);
  const cart = await getCartForUser(userId);

  if (cart.items.length === 0) {
    throw new Error("CART_EMPTY");
  }

  return prisma.$transaction(async (tx) => {
    const orderNumber = await generateOrderNumber(tx);

    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        deliveryType: data.deliveryType,
        deliveryAddress:
          data.deliveryType === "LVIV_DELIVERY" ? data.deliveryAddress : null,
        notes: data.notes ?? null,
      },
    });

    for (const line of cart.items) {
      await reserveProductUnitForCheckout(tx, line.productId);

      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: line.productId,
          titleSnapshot: line.title,
          priceSnapshot: line.priceKopiyky,
          quantity: 1,
        },
      });
    }

    await tx.cartItem.deleteMany({
      where: {
        cart: { userId },
      },
    });

    return { orderNumber };
  });
}
