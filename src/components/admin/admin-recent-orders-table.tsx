"use client";

import { useRouter } from "next/navigation";
import { OrderListStatusSelect } from "@/components/admin/order-list-status-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  adminClickableRowClassName,
  getAdminClickableRowProps,
} from "@/lib/admin/clickable-table-row";
import { formatPriceKopiyky } from "@/lib/catalog/format";
import { cn } from "@/lib/utils";
import type { AdminOrderSummaryDto } from "@/server/services/admin-order.service";

type AdminRecentOrdersTableProps = {
  orders: AdminOrderSummaryDto[];
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function deliveryLabel(
  deliveryType: AdminOrderSummaryDto["deliveryType"],
): string {
  return deliveryType === "PICKUP" ? "Самовивіз" : "Доставка по Львову";
}

export function AdminRecentOrdersTable({ orders }: AdminRecentOrdersTableProps) {
  const router = useRouter();

  return (
    <div className="min-w-0 overflow-x-auto rounded-lg border border-border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Номер</TableHead>
            <TableHead>Дата</TableHead>
            <TableHead>Покупець</TableHead>
            <TableHead>Доставка</TableHead>
            <TableHead>Сума</TableHead>
            <TableHead>Статус</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const href = `/admin/zamovlennia/${order.orderNumber}`;
            const rowProps = getAdminClickableRowProps({
              href,
              onNavigate: (target) => router.push(target),
            });

            return (
              <TableRow
                key={order.id}
                {...rowProps}
                className={cn(adminClickableRowClassName)}
              >
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell>
                  <p>{order.customerName}</p>
                  <p className="text-muted-foreground">{order.customerPhone}</p>
                </TableCell>
                <TableCell>{deliveryLabel(order.deliveryType)}</TableCell>
                <TableCell className="tabular-nums">
                  {formatPriceKopiyky(order.totalKopiyky)}
                </TableCell>
                <TableCell>
                  <OrderListStatusSelect
                    orderId={order.id}
                    status={order.status}
                    deliveryType={order.deliveryType}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
