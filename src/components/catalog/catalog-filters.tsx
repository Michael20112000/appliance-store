"use client";

import Link from "next/link";
import { useQueryStates } from "nuqs";
import { catalogParsers, catalogUrlKeys } from "@/lib/catalog/search-params";
import { cn } from "@/lib/utils";

type CategoryOption = { slug: string; name: string };

type PriceBounds = { minUah: number; maxUah: number };

type CatalogFiltersProps = {
  brands: string[];
  categories: CategoryOption[];
  activeCategorySlug?: string;
  priceBounds?: PriceBounds | null;
  className?: string;
};

export function CatalogFilters({
  brands,
  categories,
  activeCategorySlug,
  priceBounds,
  className,
}: CatalogFiltersProps) {
  void priceBounds;

  const [params, setParams] = useQueryStates(catalogParsers, {
    shallow: false,
    urlKeys: catalogUrlKeys,
  });

  return (
    <aside className={cn("space-y-6", className)}>
      <section>
        <h2 className="mb-2 text-sm font-medium">Категорія</h2>
        <ul className="space-y-1 text-sm">
          <li>
            <Link
              href="/katalog"
              className={cn(
                "block rounded-md px-2 py-1.5 hover:bg-muted",
                !activeCategorySlug && "bg-muted font-medium",
              )}
            >
              Усі товари
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/katalog/${cat.slug}`}
                className={cn(
                  "block rounded-md px-2 py-1.5 hover:bg-muted",
                  activeCategorySlug === cat.slug && "bg-muted font-medium",
                )}
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium">Бренд</h2>
        <select
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={params.brend ?? ""}
          onChange={(e) =>
            setParams({ brend: e.target.value || null, storinka: 1 })
          }
        >
          <option value="">Усі бренди</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium">Ціна, ₴</h2>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min={0}
            placeholder="Від"
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            value={params.cinaVid ?? ""}
            onChange={(e) =>
              setParams({
                cinaVid: e.target.value ? Number(e.target.value) : null,
                storinka: 1,
              })
            }
          />
          <input
            type="number"
            min={0}
            placeholder="До"
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            value={params.cinaDo ?? ""}
            onChange={(e) =>
              setParams({
                cinaDo: e.target.value ? Number(e.target.value) : null,
                storinka: 1,
              })
            }
          />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium">Стан</h2>
        <div className="space-y-2 text-sm">
          {(
            [
              ["LIKE_NEW", "Як нова"],
              ["GOOD", "Добрий стан"],
              ["FAIR", "Задовільний"],
            ] as const
          ).map(([value, label]) => {
            const checked = params.stan.includes(value);
            return (
              <label key={value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked
                      ? params.stan.filter((s) => s !== value)
                      : [...params.stan, value];
                    setParams({ stan: next, storinka: 1 });
                  }}
                />
                {label}
              </label>
            );
          })}
        </div>
      </section>

      <button
        type="button"
        className="text-sm text-primary hover:underline"
        onClick={() =>
          setParams({
            q: "",
            brend: null,
            cinaVid: null,
            cinaDo: null,
            stan: [],
            storinka: 1,
          })
        }
      >
        Скинути фільтри
      </button>
    </aside>
  );
}
