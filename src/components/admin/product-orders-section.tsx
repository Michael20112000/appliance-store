import Link from "next/link";
import type { ProductOrderListItem } from "@/server/services/admin-product.service";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";

type ProductOrdersSectionProps = {
  orders: ProductOrderListItem[];
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function ProductOrdersSection({ orders }: ProductOrdersSectionProps) {
  if (orders.length === 0) {
    return (
      <section className="max-w-2xl space-y-3 border-t border-border pt-8">
        <h2 className="text-lg font-semibold">Замовлення з цим товаром</h2>
        <p className="text-sm text-muted-foreground">
          Поки що немає замовлень, де фігурує цей товар.
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-3xl space-y-3 border-t border-border pt-8">
      <h2 className="text-lg font-semibold">Замовлення з цим товаром</h2>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
              <th className="px-3 py-2 font-medium">Номер</th>
              <th className="px-3 py-2 font-medium">Клієнт</th>
              <th className="px-3 py-2 font-medium">Статус</th>
              <th className="px-3 py-2 font-medium">К-сть</th>
              <th className="px-3 py-2 font-medium">Дата</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={`${order.orderId}-${order.createdAt.toISOString()}`}
                className="border-b border-border last:border-0"
              >
                <td className="px-3 py-2">
                  <Link
                    href={`/admin/zamovlennia/${order.orderNumber}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-3 py-2">{order.customerName}</td>
                <td className="px-3 py-2">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-3 py-2 tabular-nums">{order.quantity}</td>
                <td className="px-3 py-2 text-muted-foreground">
                  {formatDate(order.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
