import { OrderHistoryCard } from "@/components/account/order-history-card";
import type { OrderSummaryDto } from "@/types/order";

type OrderHistoryListProps = {
  orders: OrderSummaryDto[];
};

export function OrderHistoryList({ orders }: OrderHistoryListProps) {
  if (orders.length === 0) {
    return (
      <p className="text-muted-foreground">
        У вас ще немає замовлень. Додайте товари в кошик і оформіть перше
        замовлення.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {orders.map((order) => (
        <li key={order.id}>
          <OrderHistoryCard order={order} />
        </li>
      ))}
    </ul>
  );
}
