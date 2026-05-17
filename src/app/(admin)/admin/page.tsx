import Link from "next/link";
import { formatPriceKopiyky } from "@/lib/catalog/format";
import { StatCard } from "@/components/admin/stat-card";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { Button } from "@/components/ui/button";
import { getAdminDashboardStats } from "@/server/services/admin-order.service";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold md:text-3xl">Панель керування</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Нові замовлення"
          count={stats.pendingOrders}
          href="/admin/zamovlennia?filter=new"
        />
        <StatCard
          label="Товари в наявності"
          count={stats.availableProducts}
          href="/admin/tovary"
        />
        <StatCard
          label="Чернетки"
          count={stats.draftProducts}
          href="/admin/tovary?status=DRAFT"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button render={<Link href="/admin/tovary/novyi" />} size="sm" variant="outline">
          Додати товар
        </Button>
        <Button
          render={<Link href="/admin/zamovlennia" />}
          size="sm"
          variant="outline"
        >
          Переглянути замовлення
        </Button>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Останні замовлення</h2>
        {stats.recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Замовлень ще немає</p>
        ) : (
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
                  <th className="px-4 py-2 font-medium" scope="col" />
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border last:border-0"
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
        )}
      </section>
    </div>
  );
}
