import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { createOrderFromGuestCart } from "./order.service";

describe("createOrderFromGuestCart", () => {
  it("creates order without userId for guest checkout", async () => {
    const product = await prisma.product.findFirst({
      where: { quantity: { gte: 1 } },
      select: { id: true },
    });
    expect(product).toBeTruthy();

    const result = await createOrderFromGuestCart({
      customerName: "Гість Тест",
      customerPhone: "380501234567",
      deliveryType: "PICKUP",
      productIds: [product!.id],
    });

    const order = await prisma.order.findFirst({
      where: { orderNumber: result.orderNumber },
      select: { userId: true, guestAccessToken: true },
    });

    expect(order?.userId).toBeNull();
    expect(order?.guestAccessToken).toBe(result.guestAccessToken);
  });

  it("accepts explicit userId null in prisma create", async () => {
    const product = await prisma.product.findFirst({
      where: { quantity: { gte: 1 } },
      select: { id: true },
    });
    expect(product).toBeTruthy();

    const orderNumber = `ASL-TEST-${Date.now()}`;
    const token = crypto.randomUUID();

    await prisma.order.create({
      data: {
        orderNumber,
        userId: null,
        guestAccessToken: token,
        customerName: "Null userId",
        customerPhone: "380501234567",
        deliveryType: "PICKUP",
      },
    });

    const order = await prisma.order.findFirst({
      where: { orderNumber },
      select: { userId: true },
    });
    expect(order?.userId).toBeNull();

    await prisma.order.delete({ where: { orderNumber } });
  });
});
