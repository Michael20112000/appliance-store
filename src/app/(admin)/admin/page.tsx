import Link from "next/link";
import { Eye, Plus } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { AdminRecentOrdersTable } from "@/components/admin/admin-recent-orders-table";
import { Button } from "@/components/ui/button";
import { getAdminDashboardStats } from "@/server/services/admin-order.service";

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
          count={stats.inStockProducts}
          href="/admin/tovary?stock=in_stock"
        />
        <StatCard
          label="Розпродано"
          count={stats.outOfStockProducts}
          href="/admin/tovary?stock=out_of_stock"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button render={<Link href="/admin/tovary/novyi" />}>
          <Plus className="size-4" aria-hidden />
          Додати товар
        </Button>
        <Button
          render={<Link href="/admin/zamovlennia" />}
          variant="outline"
        >
          <Eye className="size-4" aria-hidden />
          Переглянути замовлення
        </Button>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Останні замовлення</h2>
        {stats.recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Замовлень ще немає</p>
        ) : (
          <AdminRecentOrdersTable orders={stats.recentOrders} />
        )}
      </section>
    </div>
  );
}
