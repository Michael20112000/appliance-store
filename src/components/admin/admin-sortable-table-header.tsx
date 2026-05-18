"use client";

import Link from "next/link";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
} from "lucide-react";

export type SortDirection = "asc" | "desc";

export function nextSortDir<T extends string>(
  currentSort: T | undefined,
  currentDir: SortDirection,
  column: T,
): SortDirection {
  if (currentSort === column) {
    return currentDir === "asc" ? "desc" : "asc";
  }
  return "desc";
}

export function getAriaSort<T extends string>(
  column: T,
  sort: T | undefined,
  dir: SortDirection,
): "ascending" | "descending" | "none" {
  if (sort !== column) return "none";
  return dir === "asc" ? "ascending" : "descending";
}

type AdminSortableTableHeaderProps<T extends string> = {
  href: string;
  label: string;
  column: T;
  sort?: T;
  dir: SortDirection;
};

export function AdminSortableTableHeader<T extends string>({
  href,
  label,
  column,
  sort,
  dir,
}: AdminSortableTableHeaderProps<T>) {
  const isActive = sort === column;

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
