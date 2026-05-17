import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AdminOrderListFilter } from "@/server/services/admin-order.service";

const filters: Array<{ key: AdminOrderListFilter; label: string }> = [
  { key: "all", label: "Усі" },
  { key: "new", label: "Нові" },
  { key: "in_progress", label: "В роботі" },
  { key: "completed", label: "Завершені" },
  { key: "cancelled", label: "Скасовані" },
];

type OrderListFiltersProps = {
  active: AdminOrderListFilter;
};

export function OrderListFilters({ active }: OrderListFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const href =
          filter.key === "all"
            ? "/admin/zamovlennia"
            : `/admin/zamovlennia?filter=${filter.key}`;

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
            {filter.label}
          </Link>
        );
      })}
    </div>
  );
}
