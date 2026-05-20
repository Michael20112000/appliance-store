"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { DayPoint } from "@/server/services/admin-analytics.service";
import { formatRevenue } from "@/server/services/admin-analytics.service";

type AnalyticsChartsProps = {
  ordersByDay: DayPoint[];
  revenueByDay: DayPoint[];
};

const ordersChartConfig = {
  value: { label: "Замовлень", color: "var(--chart-1)" },
} satisfies ChartConfig;

const revenueChartConfig = {
  value: { label: "Виручка (грн)", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function AnalyticsCharts({
  ordersByDay,
  revenueByDay,
}: AnalyticsChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          Замовлення
        </h3>
        <ChartContainer config={ordersChartConfig} className="h-[220px] w-full">
          <LineChart data={ordersByDay} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              tickFormatter={(v: string) => v.slice(5)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Виручка</h3>
        <ChartContainer
          config={revenueChartConfig}
          className="h-[220px] w-full"
        >
          <LineChart data={revenueByDay} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              tickFormatter={(v: string) => v.slice(5)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatRevenue(value as number)}
                />
              }
            />
            <Line
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
}
