"use client";

import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ADMIN_PAGE_SIZES, getPageNumbers, type AdminPageSize } from "@/lib/pagination";
import { cn } from "@/lib/utils";

type AdminListPaginationProps = {
  page: number;
  pageSize: AdminPageSize;
  totalPages: number;
  hrefFor: (params: { page: number; pageSize: AdminPageSize }) => string;
};

export function AdminListPagination({
  page,
  pageSize,
  totalPages,
  hrefFor,
}: AdminListPaginationProps) {
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Рядків на сторінці:</span>
        <div className="inline-flex overflow-hidden rounded-lg border border-border">
          {ADMIN_PAGE_SIZES.map((size) => (
            <Link
              key={size}
              href={hrefFor({ page: 1, pageSize: size })}
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
                    page > 1 ? hrefFor({ page: page - 1, pageSize }) : undefined
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
                      href={hrefFor({ page: pageNumber, pageSize })}
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
                      ? hrefFor({ page: page + 1, pageSize })
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
  );
}
