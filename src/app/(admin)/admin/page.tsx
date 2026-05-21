import Link from "next/link";
import {
  Eye,
  MessageSquare,
  Package,
  PackageX,
  Phone,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { StatCard } from "@/components/admin/stat-card";
import { AdminRecentOrdersTable } from "@/components/admin/admin-recent-orders-table";
import { Button } from "@/components/ui/button";
import { getDashboardAnalyticsPreview } from "@/server/services/admin-analytics.service";
import { getAdminDashboardStats } from "@/server/services/admin-order.service";
import { getAdminSidebarCounts } from "@/server/services/admin-sidebar.service";

export default async function AdminDashboardPage() {
  const [stats, sidebarCounts, analyticsPreview] = await Promise.all([
    getAdminDashboardStats(),
    getAdminSidebarCounts(),
    getDashboardAnalyticsPreview(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold md:text-3xl">Панель керування</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Нові замовлення"
          count={stats.pendingOrders}
          href="/admin/zamovlennia?filter=new"
          icon={ShoppingBag}
        />
        <StatCard
          label="Товари в наявності"
          count={stats.inStockProducts}
          href="/admin/tovary?stock=in_stock"
          icon={Package}
        />
        <StatCard
          label="Розпродано"
          count={stats.outOfStockProducts}
          href="/admin/tovary?stock=out_of_stock"
          icon={PackageX}
        />
        <StatCard
          label="Нові дзвінки"
          count={sidebarCounts.unresolvedCallbacks}
          href="/admin/dzvinky"
          icon={Phone}
        />
        <StatCard
          label="Активні чати"
          count={sidebarCounts.unreadChats}
          href="/admin/chaty"
          icon={MessageSquare}
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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Графіки</h2>
          <Link
            href="/admin/analityka"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Детальна аналітика →
          </Link>
        </div>
        <AnalyticsCharts
          ordersByDay={analyticsPreview.ordersByDay}
          revenueByDay={analyticsPreview.revenueByDay}
        />
      </section>

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
