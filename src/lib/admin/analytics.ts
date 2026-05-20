export type DayPoint = { day: string; value: number };

export type AnalyticsData = {
  kpi: { totalOrders: number; totalRevenue: number; totalCallbacks: number };
  ordersByDay: DayPoint[];
  revenueByDay: DayPoint[];
};

/** OrderItem.priceSnapshot is kopiyky (same as formatPriceKopiyky). */
export function kopiykyToRevenueUah(kopiyky: number): number {
  return Math.round(kopiyky / 100);
}

export function fillDays(
  rows: { day: string; value: number }[],
  days: number,
): DayPoint[] {
  const result: DayPoint[] = [];
  const map = new Map(rows.map((r) => [r.day, r.value]));
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ day: key, value: map.get(key) ?? 0 });
  }
  return result;
}

export function formatRevenue(grn: number): string {
  const formatted = grn.toLocaleString("uk-UA", { maximumFractionDigits: 0 });
  if (formatted.includes(",")) {
    return (
      grn
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " грн"
    );
  }
  return formatted + " грн";
}
