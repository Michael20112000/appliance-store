import Link from "next/link";
import { formatPriceKopiyky } from "@/lib/catalog/format";
import type { OrderSummaryDto } from "@/types/order";

const STATUS_LABELS: Record<OrderSummaryDto["status"], string> = {
  PENDING: "Нове",
  CONFIRMED: "Підтверджено",
  READY_FOR_PICKUP: "Готово до самовивозу",
  OUT_FOR_DELIVERY: "Доставляється",
  COMPLETED: "Виконано",
  CANCELLED: "Скасовано",
};

type OrderHistoryCardProps = {
  order: OrderSummaryDto;
};

export function OrderHistoryCard({ order }: OrderHistoryCardProps) {
  const date = new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(order.createdAt);

  return (
    <article className="rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium">{order.orderNumber}</p>
          <p className="text-sm text-muted-foreground">{date}</p>
        </div>
        <p className="text-lg font-semibold tabular-nums">
          {formatPriceKopiyky(order.totalKopiyky)}
        </p>
      </div>
      <p className="mt-2 text-sm">Статус: {STATUS_LABELS[order.status]}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {order.deliveryType === "PICKUP" ? "Самовивіз" : "Доставка по Львову"} ·{" "}
        {order.itemCount}{" "}
        {order.itemCount === 1 ? "товар" : order.itemCount < 5 ? "товари" : "товарів"}
      </p>
      <Link
        href={`/zamovlennia/pidtverdzhennia/${order.orderNumber}`}
        className="mt-3 inline-block text-sm text-primary hover:underline"
      >
        Деталі замовлення
      </Link>
    </article>
  );
}
