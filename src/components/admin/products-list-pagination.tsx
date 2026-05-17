"use client";

import { AdminListPagination } from "@/components/admin/admin-list-pagination";
import { adminProductsUrl } from "@/lib/admin/products-url";
import type { AdminPageSize } from "@/lib/pagination";
import type { ProductStatus } from "@/generated/prisma/client";

type ProductsListPaginationProps = {
  page: number;
  pageSize: AdminPageSize;
  totalPages: number;
  status?: ProductStatus;
  categoryId?: string;
  q?: string;
};

export function ProductsListPagination({
  page,
  pageSize,
  totalPages,
  status,
  categoryId,
  q,
}: ProductsListPaginationProps) {
  return (
    <AdminListPagination
      page={page}
      pageSize={pageSize}
      totalPages={totalPages}
      hrefFor={({ page: nextPage, pageSize: nextPageSize }) =>
        adminProductsUrl({
          page: nextPage,
          pageSize: nextPageSize,
          status,
          categoryId,
          q,
        })
      }
    />
  );
}
