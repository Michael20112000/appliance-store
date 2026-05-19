import { describe, expect, it, vi } from "vitest";
import {
  releaseProductUnitsForOrder,
  reserveProductUnitsForOrder,
  shouldReleaseInventoryOnTransition,
  shouldReserveInventoryOnTransition,
} from "./product-inventory";

describe("shouldReserveInventoryOnTransition", () => {
  it("reserves only on PENDING → CONFIRMED", () => {
    expect(shouldReserveInventoryOnTransition("PENDING", "CONFIRMED")).toBe(true);
    expect(shouldReserveInventoryOnTransition("PENDING", "CANCELLED")).toBe(false);
    expect(shouldReserveInventoryOnTransition("CONFIRMED", "CANCELLED")).toBe(false);
  });
});

describe("shouldReleaseInventoryOnTransition", () => {
  it("releases on cancel after stock was reserved", () => {
    expect(shouldReleaseInventoryOnTransition("CONFIRMED", "CANCELLED")).toBe(true);
    expect(shouldReleaseInventoryOnTransition("READY_FOR_PICKUP", "CANCELLED")).toBe(
      true,
    );
    expect(shouldReleaseInventoryOnTransition("PENDING", "CANCELLED")).toBe(false);
    expect(shouldReleaseInventoryOnTransition("CANCELLED", "CANCELLED")).toBe(false);
  });
});

describe("reserveProductUnitsForOrder", () => {
  it("decrements quantity per line", async () => {
    const update = vi.fn().mockResolvedValue({});
    const tx = { product: { update } };

    await reserveProductUnitsForOrder(tx as never, [
      { productId: "p1", quantity: 1 },
      { productId: "p2", quantity: 2 },
    ]);

    expect(update).toHaveBeenCalledTimes(2);
    expect(update).toHaveBeenCalledWith({
      where: { id: "p1", quantity: { gte: 1 } },
      data: { quantity: { decrement: 1 } },
    });
    expect(update).toHaveBeenCalledWith({
      where: { id: "p2", quantity: { gte: 2 } },
      data: { quantity: { decrement: 2 } },
    });
  });
});

describe("releaseProductUnitsForOrder", () => {
  it("increments quantity per line", async () => {
    const update = vi.fn().mockResolvedValue({});
    const tx = { product: { update } };

    await releaseProductUnitsForOrder(tx as never, [
      { productId: "p1", quantity: 1 },
      { productId: null, quantity: 1 },
    ]);

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: { quantity: { increment: 1 } },
    });
  });
});
