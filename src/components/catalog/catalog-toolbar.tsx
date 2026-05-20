"use client";

import { useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { useQueryStates } from "nuqs";
import { ActiveFilterChips } from "@/components/catalog/active-filter-chips";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { catalogSortLabel, type CatalogSortValue } from "@/lib/catalog/catalog-labels";
import { catalogParsers, catalogUrlKeys } from "@/lib/catalog/search-params";
import { pluralResultsUa } from "@/lib/catalog/format";

type CatalogToolbarProps = {
  total: number;
};

export function CatalogToolbar({ total }: CatalogToolbarProps) {
  const [params, setParams] = useQueryStates(catalogParsers, {
    shallow: false,
    urlKeys: catalogUrlKeys,
  });
  const [query, setQuery] = useState(params.q);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setQuery(params.q);
  }, [params.q]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== params.q) {
        startTransition(() => {
          setParams({ q: query, storinka: 1 });
        });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, params.q, setParams]);

  return (
    <div className="mb-6 flex flex-col gap-4">
      <ActiveFilterChips />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1">
        <label htmlFor="catalog-search" className="sr-only">
          Пошук товарів
        </label>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id="catalog-search"
          type="search"
          placeholder="Пошук за назвою або описом…"
          className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {isPending ? (
          <span className="text-sm text-muted-foreground">Шукаємо…</span>
        ) : (
          <span className="text-sm text-muted-foreground">
            Знайдено: {pluralResultsUa(total)}
          </span>
        )}
        <Select
          value={params.sort}
          onValueChange={(value) => {
            if (!value) return;
            setParams({
              sort: value as "novi" | "cina-asc" | "cina-desc",
              storinka: 1,
            });
          }}
        >
          <SelectTrigger className="w-36" aria-label="Сортування">
            <SelectValue placeholder="Сортування">
              {catalogSortLabel(params.sort as CatalogSortValue)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(["novi", "cina-asc", "cina-desc"] as const).map((value) => (
              <SelectItem key={value} value={value}>
                {catalogSortLabel(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      </div>
    </div>
  );
}
