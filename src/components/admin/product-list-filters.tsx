import Link from "next/link";
import { adminProductsUrl } from "@/lib/admin/products-url";
import type { AdminPageSize } from "@/lib/pagination";
import { cn } from "@/lib/utils";
import type { ProductStatus } from "@/generated/prisma/client";
import type { ProductFilterCounts } from "@/server/services/admin-product.service";

type CategoryOption = {
  id: string;
  name: string;
};

type ProductListFiltersProps = {
  categories: CategoryOption[];
  activeStatus?: ProductStatus;
  activeCategoryId?: string;
  pageSize: AdminPageSize;
  counts: ProductFilterCounts;
};

const STATUS_FILTERS: Array<{ value: ProductStatus | ""; label: string }> = [
  { value: "", label: "Усі статуси" },
  { value: "DRAFT", label: "Чернетки" },
  { value: "AVAILABLE", label: "В наявності" },
  { value: "SOLD", label: "Продано" },
];

function filterLabel(label: string, count: number, showCount = true): string {
  return showCount ? `${label} (${count})` : label;
}

export function ProductListFilters({
  categories,
  activeStatus,
  activeCategoryId,
  pageSize,
  counts,
}: ProductListFiltersProps) {
  return (
    <div className="space-y-4">
      <section>
        <h2 className="mb-2 text-sm font-medium">Статус товару</h2>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => {
            const active =
              (filter.value || undefined) === activeStatus ||
              (!filter.value && !activeStatus);

            return (
              <Link
                key={filter.label}
                href={adminProductsUrl({
                  status: filter.value || undefined,
                  categoryId: activeCategoryId,
                  page: 1,
                  pageSize,
                })}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {filterLabel(
                  filter.label,
                  counts.status[filter.value],
                  filter.value !== "",
                )}
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium">Категорії</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href={adminProductsUrl({
              status: activeStatus,
              page: 1,
              pageSize,
            })}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              !activeCategoryId
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            {filterLabel("Усі категорії", counts.category.all ?? 0, false)}
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={adminProductsUrl({
                status: activeStatus,
                categoryId: category.id,
                page: 1,
                pageSize,
              })}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-colors",
                activeCategoryId === category.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {filterLabel(category.name, counts.category[category.id] ?? 0)}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
