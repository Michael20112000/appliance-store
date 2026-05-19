import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/db";
import {
  assertTransitionAllowed,
  buildOrderWhere,
  buildPrismaOrderBy,
  computeTotalPages,
  getAdminDashboardStats,
  getOrderFilterCounts,
  getAllowedNextStatuses,
  INVALID_STATUS_TRANSITION,
  listOrdersAdminPaginated,
  updateOrderStatus,
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
    $queryRaw: vi.fn(),
    $transaction: vi.fn(),
  },
}));

vi.mock("@/server/services/product-inventory", () => ({
  INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK",
  releaseProductUnitsForOrder: vi.fn(),
  reserveProductUnitsForOrder: vi.fn(),
  shouldReleaseInventoryOnTransition: vi.fn(() => false),
  shouldReserveInventoryOnTransition: vi.fn(() => false),
}));

const sampleOrder = {
  id: "order-1",
  orderNumber: "ASL-20260517-0001",
  status: "PENDING",
  deliveryType: "PICKUP",
  customerName: "Test Buyer",
  customerPhone: "+380000000000",
  createdAt: new Date("2026-05-17T10:00:00.000Z"),
  items: [{ priceSnapshot: 100_00, quantity: 2 }],
};

describe("getAdminDashboardStats", () => {
  it("returns pending, product counts, and recent orders", async () => {
    vi.mocked(prisma.order.count).mockResolvedValueOnce(4);
    vi.mocked(prisma.product.count)
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(2);
    vi.mocked(prisma.order.findMany).mockResolvedValueOnce([]);

    const stats = await getAdminDashboardStats();

    expect(stats.pendingOrders).toBe(4);
    expect(stats.inStockProducts).toBe(12);
    expect(stats.outOfStockProducts).toBe(2);
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

describe("buildOrderWhere", () => {
  it("returns empty where for all filter", () => {
    expect(buildOrderWhere("all")).toEqual({});
  });

  it("maps new filter to PENDING statuses", () => {
    expect(buildOrderWhere("new")).toEqual({
      status: { in: ["PENDING"] },
    });
  });

  it("maps in_progress filter to active statuses", () => {
    expect(buildOrderWhere("in_progress")).toEqual({
      status: {
        in: ["CONFIRMED", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY"],
      },
    });
  });
});

describe("buildPrismaOrderBy", () => {
  it("maps orderNumber sort to prisma orderBy", () => {
    expect(buildPrismaOrderBy("orderNumber", "asc")).toEqual({
      orderNumber: "asc",
    });
  });
});

describe("computeTotalPages", () => {
  it("returns 1 for empty total", () => {
    expect(computeTotalPages(0, 10)).toBe(1);
  });

  it("ceil-divides total by page size", () => {
    expect(computeTotalPages(25, 10)).toBe(3);
  });
});

describe("getOrderFilterCounts", () => {
  it("returns counts for every filter tab", async () => {
    vi.mocked(prisma.order.count)
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(81)
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(2);

    const counts = await getOrderFilterCounts();

    expect(counts).toEqual({
      all: 100,
      new: 81,
      in_progress: 12,
      completed: 5,
      cancelled: 2,
    });
  });
});

describe("listOrdersAdminPaginated", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns one page with total and totalPages", async () => {
    vi.mocked(prisma.order.count).mockResolvedValueOnce(25);
    vi.mocked(prisma.order.findMany).mockResolvedValueOnce(
      Array.from({ length: 10 }, (_, index) => ({
        ...sampleOrder,
        id: `order-${index + 1}`,
        orderNumber: `ASL-20260517-000${index + 1}`,
      })) as never,
    );

    const result = await listOrdersAdminPaginated({
      filter: "all",
      page: 1,
      pageSize: 10,
      sort: "createdAt",
      dir: "desc",
    });

    expect(result.items).toHaveLength(10);
    expect(result.total).toBe(25);
    expect(result.totalPages).toBe(3);
    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
    );
  });

  it("uses orderNumber asc orderBy for that sort column", async () => {
    vi.mocked(prisma.order.count).mockResolvedValueOnce(1);
    vi.mocked(prisma.order.findMany).mockResolvedValueOnce([sampleOrder] as never);

    await listOrdersAdminPaginated({
      filter: "all",
      page: 1,
      pageSize: 20,
      sort: "orderNumber",
      dir: "asc",
    });

    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { orderNumber: "asc" },
      }),
    );
  });

  it("uses raw SQL ids for totalKopiyky sort then preserves order", async () => {
    vi.mocked(prisma.order.count).mockResolvedValueOnce(2);
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([
      { id: "order-b" },
      { id: "order-a" },
    ]);
    vi.mocked(prisma.order.findMany).mockResolvedValueOnce([
      { ...sampleOrder, id: "order-a", orderNumber: "A" },
      { ...sampleOrder, id: "order-b", orderNumber: "B" },
    ] as never);

    const result = await listOrdersAdminPaginated({
      filter: "all",
      page: 1,
      pageSize: 20,
      sort: "totalKopiyky",
      dir: "desc",
    });

    expect(prisma.$queryRaw).toHaveBeenCalled();
    expect(prisma.order.findMany).not.toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: expect.anything() }),
    );
    expect(result.items.map((item) => item.id)).toEqual(["order-b", "order-a"]);
  });
});

describe("updateOrderStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects OUT_FOR_DELIVERY for PICKUP at CONFIRMED", async () => {
    vi.mocked(prisma.$transaction).mockImplementationOnce(async (fn) => {
      const tx = {
        order: {
          findUnique: vi.fn().mockResolvedValue({
            id: "order-1",
            orderNumber: "ASL-1",
            status: "CONFIRMED",
            deliveryType: "PICKUP",
            items: [],
          }),
          update: vi.fn(),
        },
      };
      return fn(tx as never);
    });

    await expect(
      updateOrderStatus("order-1", "OUT_FOR_DELIVERY"),
    ).rejects.toThrow(INVALID_STATUS_TRANSITION);
  });

  it("rejects READY_FOR_PICKUP for LVIV_DELIVERY at CONFIRMED", async () => {
    vi.mocked(prisma.$transaction).mockImplementationOnce(async (fn) => {
      const tx = {
        order: {
          findUnique: vi.fn().mockResolvedValue({
            id: "order-2",
            orderNumber: "ASL-2",
            status: "CONFIRMED",
            deliveryType: "LVIV_DELIVERY",
            items: [],
          }),
          update: vi.fn(),
        },
      };
      return fn(tx as never);
    });

    await expect(
      updateOrderStatus("order-2", "READY_FOR_PICKUP"),
    ).rejects.toThrow(INVALID_STATUS_TRANSITION);
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
