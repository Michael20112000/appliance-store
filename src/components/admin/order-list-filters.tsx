import Link from "next/link";
import { adminOrdersUrl } from "@/lib/admin/orders-url";
import { cn } from "@/lib/utils";
import type {
  AdminOrderFilterCounts,
  AdminOrderListFilter,
} from "@/server/services/admin-order.service";
import type {
  AdminOrderListDir,
  AdminOrderListSort,
} from "@/server/validators/admin-order";

const filters: Array<{ key: AdminOrderListFilter; label: string }> = [
  { key: "all", label: "Усі" },
  { key: "new", label: "Нові" },
  { key: "in_progress", label: "В роботі" },
  { key: "completed", label: "Завершені" },
  { key: "cancelled", label: "Скасовані" },
];

type OrderListFiltersProps = {
  active: AdminOrderListFilter;
  counts: AdminOrderFilterCounts;
  pageSize: 10 | 20 | 50;
  sort: AdminOrderListSort;
  dir: AdminOrderListDir;
};

export function OrderListFilters({
  active,
  counts,
  pageSize,
  sort,
  dir,
}: OrderListFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const href = adminOrdersUrl({
          filter: filter.key,
          page: 1,
          pageSize,
          sort,
          dir,
        });

        return (
          <Link
            key={filter.key}
            href={href}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm transition-colors",
              active === filter.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            {filter.label} ({counts[filter.key]})
          </Link>
        );
      })}
    </div>
  );
}
