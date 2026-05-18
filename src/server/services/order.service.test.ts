import { afterEach, describe, expect, it, vi } from "vitest";
import { generateOrderNumber, reserveProductUnitForCheckout } from "./order.service";

describe("generateOrderNumber", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("produces ASL-YYYYMMDD-#### pattern", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-17T12:00:00Z"));

    const tx = {
      order: {
        findFirst: async () => ({ orderNumber: "ASL-20260517-0003" }),
      },
    };

    const number = await generateOrderNumber(tx as never);
    expect(number).toMatch(/^ASL-\d{8}-\d{4}$/);
    expect(number).toBe("ASL-20260517-0004");
  });

  it("starts at 0001 when no prior orders", async () => {
    const tx = {
      order: {
        findFirst: async () => null,
      },
    };

    const number = await generateOrderNumber(tx as never);
    expect(number).toMatch(/^ASL-\d{8}-0001$/);
  });
});

describe("reserveProductUnitForCheckout", () => {
  it("decrements stock without setting SOLD when units remain", async () => {
    const update = vi.fn().mockResolvedValueOnce({ quantity: 1 });
    const tx = { product: { update } };

    await reserveProductUnitForCheckout(tx as never, "prod-1");

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      where: {
        id: "prod-1",
        status: "AVAILABLE",
        quantity: { gte: 1 },
      },
      data: { quantity: { decrement: 1 } },
      select: { quantity: true },
    });
  });

  it("sets SOLD only when quantity reaches 0 after decrement", async () => {
    const update = vi
      .fn()
      .mockResolvedValueOnce({ quantity: 0 })
      .mockResolvedValueOnce({});
    const tx = { product: { update } };

    await reserveProductUnitForCheckout(tx as never, "prod-1");

    expect(update).toHaveBeenCalledTimes(2);
    expect(update).toHaveBeenNthCalledWith(2, {
      where: { id: "prod-1" },
      data: { status: "SOLD" },
    });
  });

  it("throws PRODUCT_UNAVAILABLE when decrement update misses", async () => {
    const error = Object.assign(new Error("Record not found"), {
      code: "P2025",
    });
    const update = vi.fn().mockRejectedValue(error);
    const tx = { product: { update } };

    await expect(
      reserveProductUnitForCheckout(tx as never, "prod-1"),
    ).rejects.toThrow("PRODUCT_UNAVAILABLE");
  });
});
