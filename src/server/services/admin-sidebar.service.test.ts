import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/db";
import { countUnreadForAdmin } from "@/server/services/chat.service";
import { getAdminSidebarCounts } from "./admin-sidebar.service";

vi.mock("@/lib/db", () => ({
  prisma: {
    category: { count: vi.fn() },
    product: { count: vi.fn() },
    order: { count: vi.fn() },
    callbackRequest: { count: vi.fn() },
    conversation: {
      fields: { adminLastReadAt: "adminLastReadAt" },
      count: vi.fn(),
    },
  },
}));

vi.mock("@/server/services/chat.service", () => ({
  countUnreadForAdmin: vi.fn(),
}));

describe("getAdminSidebarCounts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns object with all five count fields as numbers (shape test)", async () => {
    vi.mocked(prisma.category.count).mockResolvedValue(5);
    vi.mocked(prisma.product.count).mockResolvedValue(12);
    vi.mocked(prisma.order.count).mockResolvedValue(3);
    vi.mocked(countUnreadForAdmin).mockResolvedValue(2);
    vi.mocked(prisma.callbackRequest.count).mockResolvedValue(1);

    const result = await getAdminSidebarCounts();

    expect(result).toEqual({
      categories: expect.any(Number),
      products: expect.any(Number),
      pendingOrders: expect.any(Number),
      unreadChats: expect.any(Number),
      unresolvedCallbacks: expect.any(Number),
    });
  });

  it("maps categories to prisma.category.count() with no where filter (D-03)", async () => {
    vi.mocked(prisma.category.count).mockResolvedValue(7);
    vi.mocked(prisma.product.count).mockResolvedValue(0);
    vi.mocked(prisma.order.count).mockResolvedValue(0);
    vi.mocked(countUnreadForAdmin).mockResolvedValue(0);
    vi.mocked(prisma.callbackRequest.count).mockResolvedValue(0);

    const result = await getAdminSidebarCounts();

    expect(result.categories).toBe(7);
    expect(prisma.category.count).toHaveBeenCalledWith();
  });

  it("maps products to prisma.product.count() with no where filter (D-03)", async () => {
    vi.mocked(prisma.category.count).mockResolvedValue(0);
    vi.mocked(prisma.product.count).mockResolvedValue(42);
    vi.mocked(prisma.order.count).mockResolvedValue(0);
    vi.mocked(countUnreadForAdmin).mockResolvedValue(0);
    vi.mocked(prisma.callbackRequest.count).mockResolvedValue(0);

    const result = await getAdminSidebarCounts();

    expect(result.products).toBe(42);
    expect(prisma.product.count).toHaveBeenCalledWith();
  });

  it("maps pendingOrders to prisma.order.count({ where: { status: 'PENDING' } }) (D-01)", async () => {
    vi.mocked(prisma.category.count).mockResolvedValue(0);
    vi.mocked(prisma.product.count).mockResolvedValue(0);
    vi.mocked(prisma.order.count).mockResolvedValue(8);
    vi.mocked(countUnreadForAdmin).mockResolvedValue(0);
    vi.mocked(prisma.callbackRequest.count).mockResolvedValue(0);

    const result = await getAdminSidebarCounts();

    expect(result.pendingOrders).toBe(8);
    expect(prisma.order.count).toHaveBeenCalledWith({
      where: { status: "PENDING" },
    });
  });

  it("maps unreadChats to countUnreadForAdmin() return value (D-08)", async () => {
    vi.mocked(prisma.category.count).mockResolvedValue(0);
    vi.mocked(prisma.product.count).mockResolvedValue(0);
    vi.mocked(prisma.order.count).mockResolvedValue(0);
    vi.mocked(countUnreadForAdmin).mockResolvedValue(5);
    vi.mocked(prisma.callbackRequest.count).mockResolvedValue(0);

    const result = await getAdminSidebarCounts();

    expect(result.unreadChats).toBe(5);
    expect(countUnreadForAdmin).toHaveBeenCalledWith();
  });

  it("maps unresolvedCallbacks to prisma.callbackRequest.count({ where: { status: 'PENDING', archivedAt: null } }) (D-05)", async () => {
    vi.mocked(prisma.category.count).mockResolvedValue(0);
    vi.mocked(prisma.product.count).mockResolvedValue(0);
    vi.mocked(prisma.order.count).mockResolvedValue(0);
    vi.mocked(countUnreadForAdmin).mockResolvedValue(0);
    vi.mocked(prisma.callbackRequest.count).mockResolvedValue(4);

    const result = await getAdminSidebarCounts();

    expect(result.unresolvedCallbacks).toBe(4);
    expect(prisma.callbackRequest.count).toHaveBeenCalledWith({
      where: { status: "PENDING", archivedAt: null },
    });
  });

  it("all five queries run concurrently and result maps each value correctly (parallel execution)", async () => {
    vi.mocked(prisma.category.count).mockResolvedValue(10);
    vi.mocked(prisma.product.count).mockResolvedValue(20);
    vi.mocked(prisma.order.count).mockResolvedValue(3);
    vi.mocked(countUnreadForAdmin).mockResolvedValue(7);
    vi.mocked(prisma.callbackRequest.count).mockResolvedValue(2);

    const result = await getAdminSidebarCounts();

    expect(result).toEqual({
      categories: 10,
      products: 20,
      pendingOrders: 3,
      unreadChats: 7,
      unresolvedCallbacks: 2,
    });
    // All five queries are called exactly once (parallel — not sequential short-circuit)
    expect(prisma.category.count).toHaveBeenCalledTimes(1);
    expect(prisma.product.count).toHaveBeenCalledTimes(1);
    expect(prisma.order.count).toHaveBeenCalledTimes(1);
    expect(countUnreadForAdmin).toHaveBeenCalledTimes(1);
    expect(prisma.callbackRequest.count).toHaveBeenCalledTimes(1);
  });
});
