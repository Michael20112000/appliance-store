import { prisma } from "@/lib/db";
import {
  fillDays,
  kopiykyToRevenueUah,
  type AnalyticsData,
  type DayPoint,
} from "@/lib/admin/analytics";

export type { AnalyticsData, DayPoint } from "@/lib/admin/analytics";
export { fillDays, formatRevenue } from "@/lib/admin/analytics";

export async function getAnalyticsData(days: 7 | 30 | 90): Promise<AnalyticsData> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [orderRows, revenueRows, callbackCount] = await Promise.all([
    prisma.$queryRaw<Array<{ day: Date | string; count: bigint }>>`
      SELECT DATE("createdAt") AS day, COUNT(*) AS count
      FROM "Order"
      WHERE "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
      ORDER BY day ASC
    `,
    prisma.$queryRaw<Array<{ day: Date | string; revenue: bigint }>>`
      SELECT DATE(o."createdAt") AS day,
             COALESCE(SUM(oi."priceSnapshot" * oi.quantity), 0) AS revenue
      FROM "Order" o
      LEFT JOIN "OrderItem" oi ON oi."orderId" = o.id
      WHERE o."createdAt" >= ${since}
      GROUP BY DATE(o."createdAt")
      ORDER BY day ASC
    `,
    prisma.callbackRequest.count({ where: { createdAt: { gte: since } } }),
  ]);

  const ordersByDay = fillDays(
    orderRows.map((r) => ({
      day:
        typeof r.day === "string"
          ? r.day.slice(0, 10)
          : r.day.toISOString().slice(0, 10),
      value: Number(r.count),
    })),
    days,
  );

  const revenueByDay = fillDays(
    revenueRows.map((r) => ({
      day:
        typeof r.day === "string"
          ? r.day.slice(0, 10)
          : r.day.toISOString().slice(0, 10),
      value: kopiykyToRevenueUah(Number(r.revenue)),
    })),
    days,
  );

  return {
    kpi: {
      totalOrders: ordersByDay.reduce((s, r) => s + r.value, 0),
      totalRevenue: revenueByDay.reduce((s, r) => s + r.value, 0),
      totalCallbacks: callbackCount,
    },
    ordersByDay,
    revenueByDay,
  };
}

export async function getDashboardAnalyticsPreview(): Promise<AnalyticsData> {
  return getAnalyticsData(30);
}
