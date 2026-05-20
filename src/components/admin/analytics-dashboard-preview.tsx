"use client";

import { Line, LineChart } from "recharts";
import Link from "next/link";

import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import type { DayPoint } from "@/lib/admin/analytics";
import { formatRevenue } from "@/lib/admin/analytics";

type AnalyticsDashboardPreviewProps = {
  ordersByDay: DayPoint[];
  revenueByDay: DayPoint[];
  totalOrders: number;
  totalRevenue: number;
};

const ordersChartConfig = {
  value: { label: "Замовлень", color: "var(--chart-1)" },
} satisfies ChartConfig;

const revenueChartConfig = {
  value: { label: "Виручка (грн)", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function AnalyticsDashboardPreview({
  ordersByDay,
  revenueByDay,
  totalOrders,
  totalRevenue,
}: AnalyticsDashboardPreviewProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Аналітика (30 днів)</h2>
        <Link
          href="/admin/analityka"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Детальна аналітика →
        </Link>
      </div>
      <div className="flex gap-6">
        <div>
          <p className="text-sm text-muted-foreground">Замовлень</p>
          <p className="text-2xl font-semibold tabular-nums">{totalOrders}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Виручка</p>
          <p className="text-2xl font-semibold tabular-nums">
            {formatRevenue(totalRevenue)}
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <ChartContainer
          config={ordersChartConfig}
          className="h-[120px] w-full"
        >
          <LineChart data={ordersByDay}>
            <Line
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
        <ChartContainer
          config={revenueChartConfig}
          className="h-[120px] w-full"
        >
          <LineChart data={revenueByDay}>
            <Line
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </div>
    </section>
  );
}
