"use client";

import Link from "next/link";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPriceKopiyky } from "@/lib/catalog/format";
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

const PAGE_SIZES = [10, 20, 50] as const;

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

function getPageNumbers(
  current: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 1) return [1];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, current, current - 1, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= totalPages).sort(
    (a, b) => a - b,
  );

  const result: Array<number | "ellipsis"> = [];
  for (let index = 0; index < sorted.length; index++) {
    const page = sorted[index];
    const previous = sorted[index - 1];
    if (index > 0 && page - previous > 1) {
      result.push("ellipsis");
    }
    result.push(page);
  }
  return result;
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
    {
      id: "actions",
      header: () => <span className="sr-only">Дії</span>,
      cell: ({ row }) => (
        <Link
          href={`/admin/zamovlennia/${row.original.orderNumber}`}
          className="text-primary hover:underline"
        >
          Відкрити
        </Link>
      ),
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

  const pageNumbers = getPageNumbers(page, totalPages);
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
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="border-b border-border last:border-0">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-4 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Рядків на сторінці:</span>
          <div className="inline-flex overflow-hidden rounded-lg border border-border">
            {PAGE_SIZES.map((size) => (
              <Link
                key={size}
                href={adminOrdersUrl({
                  filter,
                  page: 1,
                  pageSize: size,
                  sort,
                  dir,
                })}
                className={cn(
                  "px-3 py-1.5 transition-colors hover:bg-muted",
                  pageSize === size && "bg-muted font-medium",
                )}
              >
                {size}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Сторінка {page} з {totalPages}
          </p>
          {totalPages > 1 ? (
            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    text="Попередня"
                    href={
                      page > 1
                        ? adminOrdersUrl({
                            filter,
                            page: page - 1,
                            pageSize,
                            sort,
                            dir,
                          })
                        : undefined
                    }
                    aria-disabled={page <= 1}
                    className={cn(page <= 1 && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>
                {pageNumbers.map((pageNumber, index) =>
                  pageNumber === "ellipsis" ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href={adminOrdersUrl({
                          filter,
                          page: pageNumber,
                          pageSize,
                          sort,
                          dir,
                        })}
                        isActive={pageNumber === page}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}
                <PaginationItem>
                  <PaginationNext
                    text="Наступна"
                    href={
                      page < totalPages
                        ? adminOrdersUrl({
                            filter,
                            page: page + 1,
                            pageSize,
                            sort,
                            dir,
                          })
                        : undefined
                    }
                    aria-disabled={page >= totalPages}
                    className={cn(
                      page >= totalPages && "pointer-events-none opacity-50",
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          ) : null}
        </div>
      </div>
    </div>
  );
}
