import type { ProductStatus } from "@/generated/prisma/client";
import type { AdminPageSize } from "@/lib/pagination";

const PRODUCTS_PATH = "/admin/tovary";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE: AdminPageSize = 20;

export type AdminProductsUrlParams = {
  page?: number;
  pageSize?: AdminPageSize;
  status?: ProductStatus;
  categoryId?: string;
  q?: string;
};

export function adminProductsUrl(params: AdminProductsUrlParams = {}): string {
  const searchParams = new URLSearchParams();

  if (params.status != null) {
    searchParams.set("status", params.status);
  }
  if (params.categoryId != null) {
    searchParams.set("categoryId", params.categoryId);
  }
  if (params.q != null && params.q.trim() !== "") {
    searchParams.set("q", params.q.trim());
  }
  if (params.page != null && params.page !== DEFAULT_PAGE) {
    searchParams.set("page", String(params.page));
  }
  if (params.pageSize != null && params.pageSize !== DEFAULT_PAGE_SIZE) {
    searchParams.set("pageSize", String(params.pageSize));
  }

  const query = searchParams.toString();
  return query ? `${PRODUCTS_PATH}?${query}` : PRODUCTS_PATH;
}
