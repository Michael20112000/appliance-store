import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/db";
import {
  getAnalyticsData,
  getDashboardAnalyticsPreview,
} from "./admin-analytics.service";

vi.mock("@/lib/db", () => ({
  prisma: {
    order: { count: vi.fn() },
    callbackRequest: { count: vi.fn() },
    $queryRaw: vi.fn(),
  },
}));

describe("getAnalyticsData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns correct kpi totals from $queryRaw results", async () => {
    vi.mocked(prisma.$queryRaw)
      .mockResolvedValueOnce([
        { day: new Date("2026-05-01"), count: BigInt(3) },
        { day: new Date("2026-05-02"), count: BigInt(5) },
      ])
      .mockResolvedValueOnce([
        { day: new Date("2026-05-01"), revenue: BigInt(6000) },
        { day: new Date("2026-05-02"), revenue: BigInt(4000) },
      ]);
    vi.mocked(prisma.callbackRequest.count).mockResolvedValueOnce(2);

    const result = await getAnalyticsData(30);

    expect(result.kpi.totalOrders).toBe(8);
    expect(result.kpi.totalRevenue).toBe(10000);
    expect(result.kpi.totalCallbacks).toBe(2);
  });

  it("BigInt count values are converted to number (not BigInt)", async () => {
    vi.mocked(prisma.$queryRaw)
      .mockResolvedValueOnce([{ day: new Date("2026-05-01"), count: BigInt(5) }])
      .mockResolvedValueOnce([]);
    vi.mocked(prisma.callbackRequest.count).mockResolvedValueOnce(0);

    const result = await getAnalyticsData(7);

    expect(typeof result.kpi.totalOrders).toBe("number");
  });

  it("BigInt revenue values are converted to number (not BigInt)", async () => {
    vi.mocked(prisma.$queryRaw)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { day: new Date("2026-05-01"), revenue: BigInt(12000) },
      ]);
    vi.mocked(prisma.callbackRequest.count).mockResolvedValueOnce(0);

    const result = await getAnalyticsData(7);

    expect(typeof result.kpi.totalRevenue).toBe("number");
  });

  it("zero-fills missing days to produce full N-day array", async () => {
    // Only one day has data — service must zero-fill the rest to get 7 total entries
    vi.mocked(prisma.$queryRaw)
      .mockResolvedValueOnce([{ day: new Date("2026-05-01"), count: BigInt(2) }])
      .mockResolvedValueOnce([]);
    vi.mocked(prisma.callbackRequest.count).mockResolvedValueOnce(0);

    const result = await getAnalyticsData(7);

    expect(result.ordersByDay).toHaveLength(7);
  });
});

describe("getDashboardAnalyticsPreview", () => {
  it("returns ordersByDay and revenueByDay with 30 entries", async () => {
    // Empty arrays from DB — zero-fill must produce 30 entries for each series
    vi.mocked(prisma.$queryRaw)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    vi.mocked(prisma.callbackRequest.count).mockResolvedValueOnce(0);

    const result = await getDashboardAnalyticsPreview();

    expect(result.ordersByDay).toHaveLength(30);
    expect(result.revenueByDay).toHaveLength(30);
  });
});
