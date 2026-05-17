import { describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/db";
import {
  assertTransitionAllowed,
  getAdminDashboardStats,
  getAllowedNextStatuses,
  getProductIdsForCancelRevert,
  INVALID_STATUS_TRANSITION,
  revertSoldProductsOnCancel,
} from "./admin-order.service";

vi.mock("@/lib/db", () => ({
  prisma: {
    order: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    product: {
      count: vi.fn(),
    },
  },
}));

describe("getAdminDashboardStats", () => {
  it("returns pending, product counts, and recent orders", async () => {
    vi.mocked(prisma.order.count).mockResolvedValueOnce(4);
    vi.mocked(prisma.product.count)
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(2);
    vi.mocked(prisma.order.findMany).mockResolvedValueOnce([]);

    const stats = await getAdminDashboardStats();

    expect(stats.pendingOrders).toBe(4);
    expect(stats.availableProducts).toBe(12);
    expect(stats.draftProducts).toBe(2);
    expect(stats.recentOrders).toEqual([]);
  });
});

describe("assertTransitionAllowed", () => {
  it("allows PENDING → CONFIRMED", () => {
    expect(() => assertTransitionAllowed("PENDING", "CONFIRMED")).not.toThrow();
  });

  it("throws INVALID_STATUS_TRANSITION for PENDING → COMPLETED", () => {
    expect(() => assertTransitionAllowed("PENDING", "COMPLETED")).toThrow(
      INVALID_STATUS_TRANSITION,
    );
  });

  it("allows CONFIRMED → READY_FOR_PICKUP and OUT_FOR_DELIVERY", () => {
    expect(() =>
      assertTransitionAllowed("CONFIRMED", "READY_FOR_PICKUP"),
    ).not.toThrow();
    expect(() =>
      assertTransitionAllowed("CONFIRMED", "OUT_FOR_DELIVERY"),
    ).not.toThrow();
  });

  it("rejects transitions from terminal statuses", () => {
    expect(() => assertTransitionAllowed("COMPLETED", "PENDING")).toThrow(
      INVALID_STATUS_TRANSITION,
    );
    expect(() => assertTransitionAllowed("CANCELLED", "CONFIRMED")).toThrow(
      INVALID_STATUS_TRANSITION,
    );
  });

  it("allows same-status no-op", () => {
    expect(() => assertTransitionAllowed("PENDING", "PENDING")).not.toThrow();
  });
});

describe("getAllowedNextStatuses", () => {
  it("returns empty array for terminal statuses", () => {
    expect(getAllowedNextStatuses("COMPLETED")).toEqual([]);
    expect(getAllowedNextStatuses("CANCELLED")).toEqual([]);
  });

  it("returns cancel option from PENDING", () => {
    expect(getAllowedNextStatuses("PENDING")).toEqual([
      "CONFIRMED",
      "CANCELLED",
    ]);
  });
});

describe("getProductIdsForCancelRevert", () => {
  it("collects only items with productId", () => {
    const ids = getProductIdsForCancelRevert([
      { productId: "prod-1" },
      { productId: null },
      { productId: "prod-2" },
    ]);
    expect(ids).toEqual(["prod-1", "prod-2"]);
  });
});

describe("revertSoldProductsOnCancel", () => {
  it("updates each linked product from SOLD to AVAILABLE", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const tx = { product: { updateMany } };

    await revertSoldProductsOnCancel(tx as never, [
      { productId: "p1" },
      { productId: null },
      { productId: "p2" },
    ]);

    expect(updateMany).toHaveBeenCalledTimes(2);
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "p1", status: "SOLD" },
      data: { status: "AVAILABLE" },
    });
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "p2", status: "SOLD" },
      data: { status: "AVAILABLE" },
    });
  });
});

describe("illegal transition pairs", () => {
  const illegalPairs: Array<[string, string]> = [
    ["PENDING", "COMPLETED"],
    ["PENDING", "READY_FOR_PICKUP"],
    ["PENDING", "OUT_FOR_DELIVERY"],
    ["CONFIRMED", "PENDING"],
    ["CONFIRMED", "COMPLETED"],
    ["READY_FOR_PICKUP", "CONFIRMED"],
    ["OUT_FOR_DELIVERY", "PENDING"],
    ["COMPLETED", "CANCELLED"],
    ["CANCELLED", "PENDING"],
  ];

  it.each(illegalPairs)(
    "rejects %s → %s",
    (from, to) => {
      expect(() =>
        assertTransitionAllowed(from as never, to as never),
      ).toThrow(INVALID_STATUS_TRANSITION);
    },
  );
});
