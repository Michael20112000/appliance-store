"use client";

import { useRouter } from "next/navigation";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import {
  adminClickableRowClassName,
  getAdminClickableRowProps,
} from "@/lib/admin/clickable-table-row";
import { formatPriceKopiyky } from "@/lib/catalog/format";
import { cn } from "@/lib/utils";
import type { AdminOrderSummaryDto } from "@/server/services/admin-order.service";

export type AdminRecentOrderRow = Pick<
  AdminOrderSummaryDto,
  "id" | "orderNumber" | "createdAt" | "status" | "totalKopiyky"
>;

type AdminRecentOrdersTableProps = {
  orders: AdminRecentOrderRow[];
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function AdminRecentOrdersTable({ orders }: AdminRecentOrdersTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
            <th className="px-4 py-2 font-medium" scope="col">
              Номер
            </th>
            <th className="px-4 py-2 font-medium" scope="col">
              Дата
            </th>
            <th className="px-4 py-2 font-medium" scope="col">
              Статус
            </th>
            <th className="px-4 py-2 font-medium" scope="col">
              Сума
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const href = `/admin/zamovlennia/${order.orderNumber}`;
            const rowProps = getAdminClickableRowProps({
              href,
              onNavigate: (target) => router.push(target),
            });

            return (
              <tr
                key={order.id}
                {...rowProps}
                className={cn(
                  "border-b border-border last:border-0",
                  adminClickableRowClassName,
                )}
              >
                <td className="px-4 py-2 font-medium">{order.orderNumber}</td>
                <td className="px-4 py-2 text-muted-foreground">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-4 py-2">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-2 tabular-nums">
                  {formatPriceKopiyky(order.totalKopiyky)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
