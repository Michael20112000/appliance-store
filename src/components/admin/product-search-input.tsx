"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createDebounce } from "@/lib/debounce";
import { adminProductsUrl } from "@/lib/admin/products-url";
import type { AdminPageSize } from "@/lib/pagination";
import type {
  AdminProductListDir,
  AdminProductListSort,
  AdminProductStockFilter,
} from "@/server/validators/admin-product";

const DEBOUNCE_MS = 300;

type ProductSearchInputProps = {
  q?: string;
  stock?: AdminProductStockFilter;
  categoryId?: string;
  pageSize: AdminPageSize;
  sort?: AdminProductListSort;
  dir?: AdminProductListDir;
};

export function ProductSearchInput({
  q,
  stock,
  categoryId,
  pageSize,
  sort,
  dir,
}: ProductSearchInputProps) {
  const router = useRouter();
  const [value, setValue] = useState(q ?? "");
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef(createDebounce(DEBOUNCE_MS));
  const isMountedRef = useRef(false);

  useEffect(() => {
    setValue(q ?? "");
  }, [q]);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    debounceRef.current(() => {
      startTransition(() => {
        router.replace(
          adminProductsUrl({
            q: value || undefined,
            stock,
            categoryId,
            pageSize,
            sort,
            dir,
            page: 1,
          }),
          { scroll: false },
        );
      });
    });
  }, [value, stock, categoryId, pageSize, sort, dir, router]);

  return (
    <div className="relative">
      <label htmlFor="admin-product-search" className="sr-only">
        Пошук товарів
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        id="admin-product-search"
        type="search"
        placeholder="Назва або бренд…"
        className="pl-9"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-busy={isPending}
      />
    </div>
  );
}
