import type { AdminOrderListFilter } from "@/server/services/admin-order.service";
import type {
  AdminOrderListDir,
  AdminOrderListSort,
} from "@/server/validators/admin-order";

const ORDERS_PATH = "/admin/zamovlennia";

const DEFAULT_FILTER: AdminOrderListFilter = "all";
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT: AdminOrderListSort = "createdAt";
const DEFAULT_DIR: AdminOrderListDir = "desc";

export type AdminOrdersUrlParams = {
  filter?: AdminOrderListFilter;
  page?: number;
  pageSize?: 10 | 20 | 50;
  sort?: AdminOrderListSort;
  dir?: AdminOrderListDir;
};

export function adminOrdersUrl(params: AdminOrdersUrlParams = {}): string {
  const searchParams = new URLSearchParams();

  if (params.filter != null && params.filter !== DEFAULT_FILTER) {
    searchParams.set("filter", params.filter);
  }
  if (params.page != null && params.page !== DEFAULT_PAGE) {
    searchParams.set("page", String(params.page));
  }
  if (params.pageSize != null && params.pageSize !== DEFAULT_PAGE_SIZE) {
    searchParams.set("pageSize", String(params.pageSize));
  }
  if (params.sort != null && params.sort !== DEFAULT_SORT) {
    searchParams.set("sort", params.sort);
  }
  if (params.dir != null && params.dir !== DEFAULT_DIR) {
    searchParams.set("dir", params.dir);
  }

  const query = searchParams.toString();
  return query ? `${ORDERS_PATH}?${query}` : ORDERS_PATH;
}
