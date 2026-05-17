import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ProductStatus } from "@/generated/prisma/client";

type CategoryOption = {
  id: string;
  name: string;
};

type ProductListFiltersProps = {
  categories: CategoryOption[];
  activeStatus?: ProductStatus;
  activeCategoryId?: string;
};

const STATUS_FILTERS: Array<{ value: ProductStatus | ""; label: string }> = [
  { value: "", label: "Усі статуси" },
  { value: "DRAFT", label: "Чернетки" },
  { value: "AVAILABLE", label: "В наявності" },
  { value: "SOLD", label: "Продано" },
];

function statusHref(status: ProductStatus | "", categoryId?: string) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (categoryId) params.set("categoryId", categoryId);
  const query = params.toString();
  return query ? `/admin/tovary?${query}` : "/admin/tovary";
}

function categoryHref(categoryId: string, status?: ProductStatus) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  params.set("categoryId", categoryId);
  return `/admin/tovary?${params.toString()}`;
}

export function ProductListFilters({
  categories,
  activeStatus,
  activeCategoryId,
}: ProductListFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {STATUS_FILTERS.map((filter) => {
        const active =
          (filter.value || undefined) === activeStatus ||
          (!filter.value && !activeStatus);

        return (
          <Link
            key={filter.label}
            href={statusHref(filter.value, activeCategoryId)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            {filter.label}
          </Link>
        );
      })}
      <div className="flex flex-wrap gap-1">
        <Link
          href={statusHref(activeStatus ?? "")}
          className={cn(
            "rounded-full border px-3 py-1 text-sm",
            !activeCategoryId
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:bg-muted",
          )}
        >
          Усі категорії
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={categoryHref(category.id, activeStatus)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm",
              activeCategoryId === category.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
