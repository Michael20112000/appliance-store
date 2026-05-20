import type { Metadata } from "next";

import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { PeriodSelector } from "@/components/admin/period-selector";
import { StatCard } from "@/components/admin/stat-card";
import { formatRevenue } from "@/lib/admin/analytics";
import { getAnalyticsData } from "@/server/services/admin-analytics.service";

export const metadata: Metadata = {
  title: "Аналітика",
};

type PageProps = {
  searchParams: Promise<{ days?: string }>;
};

export default async function AnalitykaPage({ searchParams }: PageProps) {
  const rawDays = (await searchParams).days;
  const days: 7 | 30 | 90 =
    rawDays === "7" ? 7 : rawDays === "90" ? 90 : 30;
  const data = await getAnalyticsData(days);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold md:text-3xl">Аналітика</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Замовлень" count={data.kpi.totalOrders} />
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Виручка</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">
            {formatRevenue(data.kpi.totalRevenue)}
          </p>
        </div>
        <StatCard label="Дзвінків" count={data.kpi.totalCallbacks} />
      </div>

      <PeriodSelector active={days} />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Графіки</h2>
        <AnalyticsCharts
          ordersByDay={data.ordersByDay}
          revenueByDay={data.revenueByDay}
        />
      </section>
    </div>
  );
}
