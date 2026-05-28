import type { AdminPageSize } from "@/lib/pagination";
import type {
  AdminProductListDir,
  AdminProductListSort,
  AdminProductStockFilter,
} from "@/server/validators/admin-product";

const PRODUCTS_PATH = "/admin/tovary";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE: AdminPageSize = 20;
const DEFAULT_DIR: AdminProductListDir = "desc";

export type AdminProductsUrlParams = {
  page?: number;
  pageSize?: AdminPageSize;
  stock?: AdminProductStockFilter;
  categoryId?: string;
  q?: string;
  sort?: AdminProductListSort;
  dir?: AdminProductListDir;
};

export function adminProductsUrl(params: AdminProductsUrlParams = {}): string {
  const searchParams = new URLSearchParams();

  if (params.stock != null) {
    searchParams.set("stock", params.stock);
  }
  if (params.categoryId != null) {
    searchParams.set("categoryId", params.categoryId);
  }
  if (params.q != null && params.q.trim() !== "") {
    searchParams.set("q", params.q.trim());
  }
  if (params.page != null) {
    searchParams.set("page", String(params.page));
  }
  if (params.pageSize != null && params.pageSize !== DEFAULT_PAGE_SIZE) {
    searchParams.set("pageSize", String(params.pageSize));
  }
  if (params.sort != null) {
    searchParams.set("sort", params.sort);
  }
  if (params.dir != null && params.dir !== DEFAULT_DIR) {
    searchParams.set("dir", params.dir);
  }

  const query = searchParams.toString();
  return query ? `${PRODUCTS_PATH}?${query}` : PRODUCTS_PATH;
}
