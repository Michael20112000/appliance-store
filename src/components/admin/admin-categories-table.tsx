"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import {
  adminClickableRowClassName,
  getAdminClickableRowProps,
} from "@/lib/admin/clickable-table-row";
import { adminProductsUrl } from "@/lib/admin/products-url";
import { cn } from "@/lib/utils";

export type AdminCategoryRow = {
  id: string;
  name: string;
  sortOrder: number;
  productCount: number;
};

type AdminCategoriesTableProps = {
  categories: AdminCategoryRow[];
};

export function AdminCategoriesTable({ categories }: AdminCategoriesTableProps) {
  const router = useRouter();

  const stopRowNav = (event: MouseEvent) => event.stopPropagation();

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-background">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
            <th className="px-4 py-2 font-medium">Назва</th>
            <th className="px-4 py-2 font-medium">Товари</th>
            <th className="px-4 py-2 font-medium">Порядок</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => {
            const href = `/admin/kategorii/${category.id}`;
            const rowProps = getAdminClickableRowProps({
              href,
              onNavigate: (target) => router.push(target),
            });

            return (
              <tr
                key={category.id}
                {...rowProps}
                className={cn(
                  "border-b border-border last:border-0",
                  adminClickableRowClassName,
                )}
              >
                <td className="px-4 py-2">{category.name}</td>
                <td className="px-4 py-2">
                  <Link
                    href={adminProductsUrl({ categoryId: category.id })}
                    onClick={stopRowNav}
                    onPointerDown={stopRowNav}
                  >
                    Переглянути
                    <span className="text-muted-foreground">
                      {" "}
                      ({category.productCount})
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-2">{category.sortOrder}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
