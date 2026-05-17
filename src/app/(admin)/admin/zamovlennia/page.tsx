import type { Metadata } from "next";
import { OrderListFilters } from "@/components/admin/order-list-filters";
import { OrdersTable } from "@/components/admin/orders-table";
import {
  listAllOrders,
  type AdminOrderListFilter,
} from "@/server/services/admin-order.service";

export const metadata: Metadata = {
  title: "Замовлення",
};

const VALID_FILTERS = new Set<AdminOrderListFilter>([
  "all",
  "new",
  "in_progress",
  "completed",
  "cancelled",
]);

function parseFilter(value: string | undefined): AdminOrderListFilter {
  if (value && VALID_FILTERS.has(value as AdminOrderListFilter)) {
    return value as AdminOrderListFilter;
  }
  return "all";
}

type PageProps = {
  searchParams: Promise<{ filter?: string }>;
};

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const { filter: filterParam } = await searchParams;
  const filter = parseFilter(filterParam);
  const orders = await listAllOrders(filter);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Замовлення</h1>
      <OrderListFilters active={filter} />
      {orders.length === 0 && filter === "all" ? (
        <p className="text-sm text-muted-foreground">
          Замовлень ще немає. Коли покупець оформить замовлення, воно з&apos;явиться
          тут.
        </p>
      ) : (
        <OrdersTable orders={orders} />
      )}
    </div>
  );
}
