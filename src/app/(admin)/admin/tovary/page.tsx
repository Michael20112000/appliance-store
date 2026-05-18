import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminProductsTable } from "@/components/admin/admin-products-table";
import { ProductListFilters } from "@/components/admin/product-list-filters";
import { ProductsListPagination } from "@/components/admin/products-list-pagination";
import { Button } from "@/components/ui/button";
import { listCategoriesAdmin } from "@/server/services/admin-catalog.service";
import {
  getProductFilterCounts,
  listAdminProducts,
} from "@/server/services/admin-product.service";
import {
  listAdminProductsSchema,
  type ListAdminProductsFilters,
} from "@/server/validators/admin-product";
import type { ProductStatus } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Товари",
};

type PageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    status?: string;
    categoryId?: string;
    q?: string;
    sort?: string;
    dir?: string;
  }>;
};

function parseListFilters(
  params: Awaited<PageProps["searchParams"]>,
): ListAdminProductsFilters {
  const status =
    params.status &&
    ["DRAFT", "AVAILABLE", "SOLD"].includes(params.status)
      ? (params.status as ProductStatus)
      : undefined;

  return listAdminProductsSchema.parse({
    page: params.page,
    pageSize: params.pageSize,
    status,
    categoryId: params.categoryId,
    q: params.q,
    sort: params.sort,
    dir: params.dir,
  });
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const filters = parseListFilters(rawParams);

  const categories = await listCategoriesAdmin();
  const categoryIds = categories.map((category) => category.id);

  const [result, filterCounts] = await Promise.all([
    listAdminProducts(filters),
    getProductFilterCounts(
      categoryIds,
      filters.categoryId,
      filters.status,
    ),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Товари</h1>
        <Button render={<Link href="/admin/tovary/novyi" />}>
          <Plus className="size-4" aria-hidden />
          Додати товар
        </Button>
      </div>

      <ProductListFilters
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
        }))}
        activeStatus={filters.status}
        activeCategoryId={filters.categoryId}
        pageSize={filters.pageSize}
        sort={filters.sort}
        dir={filters.dir}
        counts={filterCounts}
      />

      {result.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Товарів не знайдено. Створіть перший товар або змініть фільтри.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <AdminProductsTable
            items={result.items}
            sort={filters.sort}
            dir={filters.dir}
            pageSize={filters.pageSize}
            status={filters.status}
            categoryId={filters.categoryId}
            q={filters.q}
          />
          <ProductsListPagination
            page={result.page}
            pageSize={filters.pageSize}
            totalPages={result.totalPages}
            status={filters.status}
            categoryId={filters.categoryId}
            q={filters.q}
            sort={filters.sort}
            dir={filters.dir}
          />
        </div>
      )}
    </div>
  );
}
