import Link from "next/link";
import { adminProductsUrl } from "@/lib/admin/products-url";
import type { AdminPageSize } from "@/lib/pagination";
import { cn } from "@/lib/utils";
import type { ProductFilterCounts, ProductStockFilterKey } from "@/server/services/admin-product.service";
import type {
  AdminProductListDir,
  AdminProductListSort,
  AdminProductStockFilter,
} from "@/server/validators/admin-product";

type CategoryOption = {
  id: string;
  name: string;
};

type ProductListFiltersProps = {
  categories: CategoryOption[];
  activeStock?: AdminProductStockFilter;
  activeCategoryId?: string;
  pageSize: AdminPageSize;
  sort?: AdminProductListSort;
  dir?: AdminProductListDir;
  counts: ProductFilterCounts;
};

const STOCK_FILTERS: Array<{ value: ProductStockFilterKey; label: string }> = [
  { value: "", label: "Усі товари" },
  { value: "in_stock", label: "В наявності" },
  { value: "out_of_stock", label: "Розпродано" },
];

function filterLabel(label: string, count: number, showCount = true): string {
  return showCount ? `${label} (${count})` : label;
}

export function ProductListFilters({
  categories,
  activeStock,
  activeCategoryId,
  pageSize,
  sort,
  dir,
  counts,
}: ProductListFiltersProps) {
  return (
    <div className="space-y-4">
      <section>
        <h2 className="mb-2 text-sm font-medium">Наявність</h2>
        <div className="flex flex-wrap gap-2">
          {STOCK_FILTERS.map((filter) => {
            const active =
              (filter.value || undefined) === activeStock ||
              (!filter.value && !activeStock);

            return (
              <Link
                key={filter.label}
                href={adminProductsUrl({
                  stock: filter.value || undefined,
                  categoryId: activeCategoryId,
                  page: 1,
                  pageSize,
                  sort,
                  dir,
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
                  counts.stock[filter.value],
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
              stock: activeStock,
              page: 1,
              pageSize,
              sort,
              dir,
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
                stock: activeStock,
                categoryId: category.id,
                page: 1,
                pageSize,
                sort,
                dir,
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