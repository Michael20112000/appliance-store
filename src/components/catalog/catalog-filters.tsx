"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useQueryStates } from "nuqs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  ALL_BRANDS_VALUE,
  brandSelectToUrlParam,
  resolveBrandSelectValue,
} from "@/lib/catalog/catalog-labels";
import { catalogParsers, catalogUrlKeys } from "@/lib/catalog/search-params";
import { categoriesWithAvailableProducts } from "@/lib/catalog/categories";
import { createThrottle } from "@/lib/catalog/throttle";
import { cn } from "@/lib/utils";

export const PRICE_STEP_UAH = 50;
export const PRICE_URL_THROTTLE_MS = 200;

type CategoryOption = { slug: string; name: string; productCount: number };

export type PriceBounds = { minUah: number; maxUah: number };

export type CatalogFiltersPanelProps = {
  brands: string[];
  categories: CategoryOption[];
  totalProductCount: number;
  activeCategorySlug?: string;
  priceBounds?: PriceBounds | null;
  className?: string;
};

type CatalogFiltersProps = CatalogFiltersPanelProps;

function snapPriceToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function clampPrice(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeThumbRange(
  values: readonly number[],
  bounds: PriceBounds,
): [number, number] {
  const { minUah: min, maxUah: max } = bounds;
  let low = clampPrice(
    snapPriceToStep(values[0] ?? min, PRICE_STEP_UAH),
    min,
    max,
  );
  let high = clampPrice(
    snapPriceToStep(values[1] ?? max, PRICE_STEP_UAH),
    min,
    max,
  );
  if (low > high) [low, high] = [high, low];
  return [low, high];
}

export function normalizeSliderBounds(bounds: PriceBounds): {
  sliderMin: number;
  sliderMax: number;
} {
  const sliderMin =
    Math.floor(bounds.minUah / PRICE_STEP_UAH) * PRICE_STEP_UAH;
  let sliderMax = Math.ceil(bounds.maxUah / PRICE_STEP_UAH) * PRICE_STEP_UAH;
  if (sliderMin === sliderMax) sliderMax = sliderMin + PRICE_STEP_UAH;
  return { sliderMin, sliderMax };
}

function thumbValuesFromParams(
  cinaVid: number | null,
  cinaDo: number | null,
  bounds: PriceBounds,
): [number, number] {
  const low = cinaVid ?? bounds.minUah;
  const high = cinaDo ?? bounds.maxUah;
  return normalizeThumbRange([low, high], bounds);
}

function toSliderValues(
  value: number | readonly number[],
): readonly number[] {
  return typeof value === "number" ? [value] : value;
}

export function CatalogFiltersPanel({
  brands,
  categories,
  totalProductCount,
  activeCategorySlug,
  priceBounds,
  className,
}: CatalogFiltersPanelProps) {
  const [params, setParams] = useQueryStates(catalogParsers, {
    shallow: false,
    urlKeys: catalogUrlKeys,
  });

  const bounds = priceBounds ?? null;
  const hasPriceBounds = bounds != null;
  const visibleCategories = categoriesWithAvailableProducts(categories);

  const [dragValues, setDragValues] = useState<[number, number] | null>(null);

  const thumbValues = useMemo((): [number, number] => {
    if (dragValues) return dragValues;
    if (!bounds) return [0, 0];
    return thumbValuesFromParams(params.cinaVid, params.cinaDo, bounds);
  }, [dragValues, bounds, params.cinaVid, params.cinaDo]);

  const { sliderMin, sliderMax } = bounds
    ? normalizeSliderBounds(bounds)
    : { sliderMin: 0, sliderMax: 0 };

  const minInputValue = useMemo(() => {
    if (!bounds) return "";
    if (dragValues) return dragValues[0];
    return params.cinaVid ?? bounds.minUah;
  }, [bounds, dragValues, params.cinaVid]);

  const maxInputValue = useMemo(() => {
    if (!bounds) return "";
    if (dragValues) return dragValues[1];
    return params.cinaDo ?? bounds.maxUah;
  }, [bounds, dragValues, params.cinaDo]);

  const throttledPriceUrlSync = useMemo(
    () => createThrottle(PRICE_URL_THROTTLE_MS),
    [],
  );

  const syncPriceToUrl = useCallback(
    (cinaVid: number, cinaDo: number, immediate: boolean) => {
      const apply = () => {
        if (!bounds) return;
        const atMin = cinaVid <= bounds.minUah;
        const atMax = cinaDo >= bounds.maxUah;
        void setParams({
          cinaVid: atMin && atMax ? null : atMin ? null : cinaVid,
          cinaDo: atMin && atMax ? null : atMax ? null : cinaDo,
          storinka: 1,
        });
      };
      if (immediate) {
        throttledPriceUrlSync.flush();
        apply();
        return;
      }
      throttledPriceUrlSync(apply);
    },
    [bounds, setParams, throttledPriceUrlSync],
  );

  const handleMinInput = (raw: string) => {
    if (!bounds) return;
    setDragValues(null);
    if (!raw) {
      void setParams({ cinaVid: null, storinka: 1 });
      return;
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;
    const cinaVid = clampPrice(
      snapPriceToStep(parsed, PRICE_STEP_UAH),
      bounds.minUah,
      bounds.maxUah,
    );
    let cinaDo = params.cinaDo;
    if (cinaDo != null && cinaVid > cinaDo) cinaDo = cinaVid;
    void setParams({ cinaVid, cinaDo, storinka: 1 });
  };

  const handleMaxInput = (raw: string) => {
    if (!bounds) return;
    setDragValues(null);
    if (!raw) {
      void setParams({ cinaDo: null, storinka: 1 });
      return;
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;
    const cinaDo = clampPrice(
      snapPriceToStep(parsed, PRICE_STEP_UAH),
      bounds.minUah,
      bounds.maxUah,
    );
    let cinaVid = params.cinaVid;
    if (cinaVid != null && cinaDo < cinaVid) cinaVid = cinaDo;
    void setParams({ cinaVid, cinaDo, storinka: 1 });
  };

  return (
    <div className={cn("space-y-6", className)}>
      <section>
        <h2 className="mb-2 text-sm font-medium">Категорія</h2>
        <ul className="space-y-1 text-sm">
          <li>
            <Link
              href="/katalog"
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted",
                !activeCategorySlug && "bg-muted font-medium",
              )}
            >
              <span>Усі товари</span>
              <Badge variant="secondary">{totalProductCount}</Badge>
            </Link>
          </li>
          {visibleCategories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/katalog/${cat.slug}`}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted",
                  activeCategorySlug === cat.slug && "bg-muted font-medium",
                )}
              >
                <span>{cat.name}</span>
                <Badge variant="secondary">{cat.productCount}</Badge>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium">Бренд</h2>
        <Select
          value={resolveBrandSelectValue(params.brend)}
          onValueChange={(value) => {
            if (!value) return;
            setParams({
              brend: brandSelectToUrlParam(value),
              storinka: 1,
            });
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Усі бренди">
              {resolveBrandSelectValue(params.brend) === ALL_BRANDS_VALUE
                ? "Усі бренди"
                : params.brend}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_BRANDS_VALUE}>Усі бренди</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium">Ціна, ₴</h2>
        {!hasPriceBounds ? (
          <p className="text-sm text-muted-foreground">
            Немає товарів для фільтра ціни
          </p>
        ) : (
          <>
            <Slider
              className="mt-3"
              min={sliderMin}
              max={sliderMax}
              step={PRICE_STEP_UAH}
              value={thumbValues}
              aria-label="Діапазон ціни"
              onValueChange={(value) => {
                const [low, high] = normalizeThumbRange(
                  toSliderValues(value),
                  bounds,
                );
                setDragValues([low, high]);
                syncPriceToUrl(low, high, false);
              }}
              onValueCommitted={(value) => {
                const [low, high] = normalizeThumbRange(
                  toSliderValues(value),
                  bounds,
                );
                setDragValues(null);
                syncPriceToUrl(low, high, true);
              }}
            />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <input
                type="number"
                min={bounds.minUah}
                max={bounds.maxUah}
                step={PRICE_STEP_UAH}
                placeholder="Від"
                className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                value={minInputValue}
                onChange={(e) => handleMinInput(e.target.value)}
              />
              <input
                type="number"
                min={bounds.minUah}
                max={bounds.maxUah}
                step={PRICE_STEP_UAH}
                placeholder="До"
                className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                value={maxInputValue}
                onChange={(e) => handleMaxInput(e.target.value)}
              />
            </div>
          </>
        )}
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
        onClick={() => {
          setDragValues(null);
          void setParams({
            q: "",
            brend: null,
            cinaVid: null,
            cinaDo: null,
            stan: [],
            storinka: 1,
          });
        }}
      >
        Скинути фільтри
      </button>
    </div>
  );
}

export function CatalogFilters(props: CatalogFiltersProps) {
  return (
    <aside className={cn("hidden lg:block", props.className)}>
      <CatalogFiltersPanel {...props} />
    </aside>
  );
}
