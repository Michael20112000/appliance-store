import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type { OrderDetailDto, OrderSummaryDto } from "@/types/order";
import type { CheckoutInput, GuestCheckoutInput } from "../validators/order";
import { checkoutSchema, guestCheckoutSchema } from "../validators/order";
import { clearCart, getCartForUser, resolveGuestCartProducts } from "./cart.service";

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

function mapOrderDetail(
  order: {
    id: string;
    orderNumber: string;
    status: OrderDetailDto["status"];
    deliveryType: OrderDetailDto["deliveryType"];
    customerName: string;
    customerPhone: string;
    deliveryAddress: string | null;
    notes: string | null;
    createdAt: Date;
    items: {
      titleSnapshot: string;
      priceSnapshot: number;
      quantity: number;
    }[];
  },
): OrderDetailDto {
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

export async function getOrderForUser(
  userId: string,
  orderNumber: string,
): Promise<OrderDetailDto | null> {
  const order = await prisma.order.findFirst({
    where: { userId, orderNumber },
    include: { items: true },
  });

  if (!order) return null;

  return mapOrderDetail(order);
}

export async function getOrderForGuest(
  orderNumber: string,
  guestAccessToken: string,
): Promise<OrderDetailDto | null> {
  const order = await prisma.order.findFirst({
    where: { orderNumber, guestAccessToken, userId: null },
    include: { items: true },
  });

  if (!order) return null;

  return mapOrderDetail(order);
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

import { assertProductsAvailableForCheckout } from "./product-inventory";

type OrderLineInput = {
  productId: string;
  title: string;
  priceKopiyky: number;
};

async function createOrderInTransaction(
  tx: Prisma.TransactionClient,
  lines: OrderLineInput[],
  data: CheckoutInput,
  options: { userId: string | null; guestAccessToken?: string },
): Promise<{ orderNumber: string }> {
  const orderNumber = await generateOrderNumber(tx);

  const order = await tx.order.create({
    data: {
      orderNumber,
      userId: options.userId,
      guestAccessToken: options.guestAccessToken ?? null,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      deliveryType: data.deliveryType,
      deliveryAddress:
        data.deliveryType === "LVIV_DELIVERY" ? data.deliveryAddress : null,
      notes: data.notes ?? null,
    },
  });

  await assertProductsAvailableForCheckout(
    tx,
    lines.map((line) => line.productId),
  );

  for (const line of lines) {
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

  return { orderNumber };
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

  const lines: OrderLineInput[] = cart.items.map((line) => ({
    productId: line.productId,
    title: line.title,
    priceKopiyky: line.priceKopiyky,
  }));

  const result = await prisma.$transaction(async (tx) => {
    const created = await createOrderInTransaction(tx, lines, data, { userId });
    await tx.cartItem.deleteMany({
      where: {
        cart: { userId },
      },
    });
    return created;
  });

  return result;
}

export async function createOrderFromGuestCart(
  input: GuestCheckoutInput,
): Promise<{ orderNumber: string; guestAccessToken: string }> {
  const data = guestCheckoutSchema.parse(input);
  const cart = await resolveGuestCartProducts(data.productIds);

  if (cart.items.length === 0) {
    throw new Error("CART_EMPTY");
  }

  const guestAccessToken = crypto.randomUUID();

  const { orderNumber } = await prisma.$transaction(async (tx) =>
    createOrderInTransaction(
      tx,
      cart.items.map((line) => ({
        productId: line.productId,
        title: line.title,
        priceKopiyky: line.priceKopiyky,
      })),
      data,
      { userId: null, guestAccessToken },
    ),
  );

  return { orderNumber, guestAccessToken };
}
