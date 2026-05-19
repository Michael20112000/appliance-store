"use client";

import { useRouter } from "next/navigation";
import { getCldImageUrl } from "next-cloudinary";
import type { ProductStatus } from "@/generated/prisma/client";
import {
  AdminSortableTableHeader,
  getAriaSort,
  nextSortDir,
} from "@/components/admin/admin-sortable-table-header";
import { ProductListStatusSelect } from "@/components/admin/product-list-status-select";
import {
  adminClickableRowClassName,
  getAdminClickableRowProps,
} from "@/lib/admin/clickable-table-row";
import { adminProductsUrl } from "@/lib/admin/products-url";
import { formatPriceKopiyky } from "@/lib/catalog/format";
import type { AdminPageSize } from "@/lib/pagination";
import { cn } from "@/lib/utils";
import type {
  AdminProductListDir,
  AdminProductListSort,
} from "@/server/validators/admin-product";

export type AdminProductListItem = {
  id: string;
  title: string;
  brand: string;
  price: number;
  quantity: number;
  status: ProductStatus;
  category: { name: string };
  images: {
    cloudinaryPublicId: string;
    alt: string | null;
  }[];
};

type AdminProductsTableProps = {
  items: AdminProductListItem[];
  sort?: AdminProductListSort;
  dir: AdminProductListDir;
  pageSize: AdminPageSize;
  status?: ProductStatus;
  categoryId?: string;
  q?: string;
};

const SORTABLE_COLUMNS_BEFORE_QUANTITY = [
  { key: "title" as const, label: "Назва" },
  { key: "category" as const, label: "Категорія" },
  { key: "price" as const, label: "Ціна" },
] as const;

const SORTABLE_COLUMNS_AFTER_QUANTITY = [
  { key: "status" as const, label: "Статус" },
] as const;

export function AdminProductsTable({
  items,
  sort,
  dir,
  pageSize,
  status,
  categoryId,
  q,
}: AdminProductsTableProps) {
  const router = useRouter();

  function sortHeaderHref(column: AdminProductListSort) {
    return adminProductsUrl({
      sort: column,
      dir: nextSortDir(sort, dir, column),
      page: 1,
      pageSize,
      status,
      categoryId,
      q,
    });
  }

  return (
    <div className="min-w-0 overflow-x-auto rounded-lg border border-border bg-background">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
            <th className="px-3 py-2 font-medium">Фото</th>
            {SORTABLE_COLUMNS_BEFORE_QUANTITY.map((column) => (
              <th
                key={column.key}
                className="px-3 py-2 font-medium"
                aria-sort={getAriaSort(column.key, sort, dir)}
              >
                <AdminSortableTableHeader
                  href={sortHeaderHref(column.key)}
                  label={column.label}
                  column={column.key}
                  sort={sort}
                  dir={dir}
                />
              </th>
            ))}
            <th className="px-3 py-2 font-medium">Кількість</th>
            {SORTABLE_COLUMNS_AFTER_QUANTITY.map((column) => (
              <th
                key={column.key}
                className="px-3 py-2 font-medium"
                aria-sort={getAriaSort(column.key, sort, dir)}
              >
                <AdminSortableTableHeader
                  href={sortHeaderHref(column.key)}
                  label={column.label}
                  column={column.key}
                  sort={sort}
                  dir={dir}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((product) => {
            const thumb = product.images[0];
            const thumbUrl = thumb
              ? getCldImageUrl({
                  src: thumb.cloudinaryPublicId,
                  width: 72,
                  height: 72,
                  crop: "fill",
                })
              : null;

            const href = `/admin/tovary/${product.id}`;
            const rowProps = getAdminClickableRowProps({
              href,
              onNavigate: (target) => router.push(target),
            });

            return (
              <tr
                key={product.id}
                {...rowProps}
                className={cn(
                  "border-b border-border last:border-0",
                  adminClickableRowClassName,
                )}
              >
                <td className="px-3 py-2">
                  {thumbUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumbUrl}
                      alt={thumb.alt ?? product.title}
                      width={72}
                      height={72}
                      className="size-[72px] rounded-md object-cover"
                    />
                  ) : (
                    <span className="inline-flex size-[72px] items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                      —
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <p className="font-medium">{product.title}</p>
                  <p className="text-xs text-muted-foreground">{product.brand}</p>
                </td>
                <td className="px-3 py-2">{product.category.name}</td>
                <td className="px-3 py-2 tabular-nums">
                  {formatPriceKopiyky(product.price)}
                </td>
                <td className="px-3 py-2 tabular-nums">{product.quantity}</td>
                <td className="px-3 py-2">
                  <ProductListStatusSelect
                    productId={product.id}
                    status={product.status}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
