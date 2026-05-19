import type { Metadata } from "next";
import { OrderListFilters } from "@/components/admin/order-list-filters";
import { OrdersDataTable } from "@/components/admin/orders-data-table";
import {
  getOrderFilterCounts,
  listOrdersAdminPaginated,
} from "@/server/services/admin-order.service";
import { listOrdersAdminSchema } from "@/server/validators/admin-order";

export const metadata: Metadata = {
  title: "Замовлення",
};

type PageProps = {
  searchParams: Promise<{
    filter?: string;
    page?: string;
    pageSize?: string;
    sort?: string;
    dir?: string;
  }>;
};

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const params = listOrdersAdminSchema.parse(rawParams);
  const [result, filterCounts] = await Promise.all([
    listOrdersAdminPaginated(params),
    getOrderFilterCounts(),
  ]);

  return (
    <div className="min-w-0 space-y-6">
      <h1 className="text-2xl font-semibold">Замовлення</h1>
      <OrderListFilters
        active={params.filter}
        counts={filterCounts}
        pageSize={params.pageSize}
        sort={params.sort}
        dir={params.dir}
      />
      {result.total === 0 && params.filter === "all" ? (
        <p className="text-sm text-muted-foreground">
          Замовлень ще немає. Коли покупець оформить замовлення, воно з&apos;явиться
          тут.
        </p>
      ) : result.total === 0 ? (
        <p className="text-sm text-muted-foreground">Нічого не знайдено</p>
      ) : (
        <OrdersDataTable
          data={result.items}
          filter={params.filter}
          page={result.page}
          pageSize={result.pageSize}
          totalPages={result.totalPages}
          sort={params.sort}
          dir={params.dir}
        />
      )}
    </div>
  );
}
