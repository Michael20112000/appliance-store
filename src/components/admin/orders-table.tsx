import Link from "next/link";
import { formatPriceKopiyky } from "@/lib/catalog/format";
import type { AdminOrderSummaryDto } from "@/server/services/admin-order.service";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";

type OrdersTableProps = {
  orders: AdminOrderSummaryDto[];
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function deliveryLabel(deliveryType: AdminOrderSummaryDto["deliveryType"]): string {
  return deliveryType === "PICKUP" ? "Самовивіз" : "Доставка по Львову";
}

export function OrdersTable({ orders }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Нічого не знайдено</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-background">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="px-4 py-2 font-medium">Номер</th>
            <th className="px-4 py-2 font-medium">Дата</th>
            <th className="px-4 py-2 font-medium">Покупець</th>
            <th className="px-4 py-2 font-medium">Доставка</th>
            <th className="px-4 py-2 font-medium">Сума</th>
            <th className="px-4 py-2 font-medium">Статус</th>
            <th className="px-4 py-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-b border-border last:border-0"
            >
              <td className="px-4 py-2 font-medium">{order.orderNumber}</td>
              <td className="px-4 py-2 text-muted-foreground">
                {formatDate(order.createdAt)}
              </td>
              <td className="px-4 py-2">
                <p>{order.customerName}</p>
                <p className="text-muted-foreground">{order.customerPhone}</p>
              </td>
              <td className="px-4 py-2">{deliveryLabel(order.deliveryType)}</td>
              <td className="px-4 py-2 tabular-nums">
                {formatPriceKopiyky(order.totalKopiyky)}
              </td>
              <td className="px-4 py-2">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="px-4 py-2 text-right">
                <Link
                  href={`/admin/zamovlennia/${order.orderNumber}`}
                  className="text-primary hover:underline"
                >
                  Відкрити
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
