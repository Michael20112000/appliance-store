"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
} from "lucide-react";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { AdminListPagination } from "@/components/admin/admin-list-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPriceKopiyky } from "@/lib/catalog/format";
import {
  adminClickableRowClassName,
  getAdminClickableRowProps,
} from "@/lib/admin/clickable-table-row";
import { adminOrdersUrl } from "@/lib/admin/orders-url";
import { cn } from "@/lib/utils";
import type {
  AdminOrderListFilter,
  AdminOrderSummaryDto,
} from "@/server/services/admin-order.service";
import type {
  AdminOrderListDir,
  AdminOrderListSort,
} from "@/server/validators/admin-order";

type OrdersDataTableProps = {
  data: AdminOrderSummaryDto[];
  filter: AdminOrderListFilter;
  page: number;
  pageSize: 10 | 20 | 50;
  totalPages: number;
  sort: AdminOrderListSort;
  dir: AdminOrderListDir;
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function deliveryLabel(deliveryType: AdminOrderSummaryDto["deliveryType"]): string {
  return deliveryType === "PICKUP" ? "Самовивіз" : "Доставка по Львову";
}

function nextSortDir(
  currentSort: AdminOrderListSort,
  currentDir: AdminOrderListDir,
  column: AdminOrderListSort,
): AdminOrderListDir {
  if (currentSort === column) {
    return currentDir === "asc" ? "desc" : "asc";
  }
  return "desc";
}

function getAriaSort(
  column: AdminOrderListSort,
  sort: AdminOrderListSort,
  dir: AdminOrderListDir,
): "ascending" | "descending" | "none" {
  if (sort !== column) return "none";
  return dir === "asc" ? "ascending" : "descending";
}

type SortableHeaderProps = {
  column: AdminOrderListSort;
  label: string;
  filter: AdminOrderListFilter;
  pageSize: 10 | 20 | 50;
  sort: AdminOrderListSort;
  dir: AdminOrderListDir;
};

function SortableHeader({
  column,
  label,
  filter,
  pageSize,
  sort,
  dir,
}: SortableHeaderProps) {
  const isActive = sort === column;
  const href = adminOrdersUrl({
    filter,
    page: 1,
    pageSize,
    sort: column,
    dir: nextSortDir(sort, dir, column),
  });

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 hover:text-foreground"
    >
      {label}
      {isActive ? (
        dir === "asc" ? (
          <ArrowUpIcon className="size-3.5" aria-hidden />
        ) : (
          <ArrowDownIcon className="size-3.5" aria-hidden />
        )
      ) : (
        <ArrowUpDownIcon className="size-3.5 opacity-50" aria-hidden />
      )}
    </Link>
  );
}

export function OrdersDataTable({
  data,
  filter,
  page,
  pageSize,
  totalPages,
  sort,
  dir,
}: OrdersDataTableProps) {
  const router = useRouter();
  const columns: ColumnDef<AdminOrderSummaryDto>[] = [
    {
      accessorKey: "orderNumber",
      header: () => (
        <SortableHeader
          column="orderNumber"
          label="Номер"
          filter={filter}
          pageSize={pageSize}
          sort={sort}
          dir={dir}
        />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.orderNumber}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <SortableHeader
          column="createdAt"
          label="Дата"
          filter={filter}
          pageSize={pageSize}
          sort={sort}
          dir={dir}
        />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "customer",
      header: "Покупець",
      cell: ({ row }) => (
        <>
          <p>{row.original.customerName}</p>
          <p className="text-muted-foreground">{row.original.customerPhone}</p>
        </>
      ),
    },
    {
      accessorKey: "deliveryType",
      header: "Доставка",
      cell: ({ row }) => deliveryLabel(row.original.deliveryType),
    },
    {
      accessorKey: "totalKopiyky",
      header: () => (
        <SortableHeader
          column="totalKopiyky"
          label="Сума"
          filter={filter}
          pageSize={pageSize}
          sort={sort}
          dir={dir}
        />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">
          {formatPriceKopiyky(row.original.totalKopiyky)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: () => (
        <SortableHeader
          column="status"
          label="Статус"
          filter={filter}
          pageSize={pageSize}
          sort={sort}
          dir={dir}
        />
      ),
      cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: totalPages,
    state: {
      pagination: { pageIndex: page - 1, pageSize },
      sorting: [{ id: sort, desc: dir === "desc" }],
    },
  });

  const sortableColumns: AdminOrderListSort[] = [
    "orderNumber",
    "createdAt",
    "totalKopiyky",
    "status",
  ];

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-border text-muted-foreground hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => {
                  const columnId = header.column.id;
                  const ariaSort = sortableColumns.includes(
                    columnId as AdminOrderListSort,
                  )
                    ? getAriaSort(columnId as AdminOrderListSort, sort, dir)
                    : undefined;

                  return (
                    <TableHead
                      key={header.id}
                      aria-sort={ariaSort}
                      className="px-4 py-2 font-medium"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => {
              const href = `/admin/zamovlennia/${row.original.orderNumber}`;
              const rowProps = getAdminClickableRowProps({
                href,
                onNavigate: (target) => router.push(target),
              });

              return (
              <TableRow
                key={row.id}
                {...rowProps}
                className={cn(
                  "border-b border-border last:border-0",
                  adminClickableRowClassName,
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-4 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AdminListPagination
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        hrefFor={({ page: nextPage, pageSize: nextPageSize }) =>
          adminOrdersUrl({
            filter,
            page: nextPage,
            pageSize: nextPageSize,
            sort,
            dir,
          })
        }
      />
    </div>
  );
}
