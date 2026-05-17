import type { Metadata } from "next";
import Link from "next/link";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { ProductGrid } from "@/components/catalog/product-grid";
import { buttonVariants } from "@/components/ui/button";
import {
  catalogListingMetadata,
  hasActiveCatalogFilters,
} from "@/lib/catalog/metadata";
import {
  catalogSearchParamsCache,
  parsersToFilters,
} from "@/lib/catalog/search-params";
import { cn } from "@/lib/utils";
import {
  getCatalogPriceBounds,
  getDistinctBrands,
  listCategories,
  listPublicProducts,
} from "@/server/services/catalog.service";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const parsed = await catalogSearchParamsCache.parse(searchParams);
  return catalogListingMetadata({
    hasActiveFilters: hasActiveCatalogFilters(parsed),
  });
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const parsed = await catalogSearchParamsCache.parse(searchParams);
  const filters = parsersToFilters(parsed);

  const [categories, brands, priceBounds, result] = await Promise.all([
    listCategories(),
    getDistinctBrands(),
    getCatalogPriceBounds(),
    listPublicProducts({
      filters,
      page: parsed.storinka,
      pageSize: 24,
      sort: parsed.sort,
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">
        Каталог б/у техніки
      </h1>
      <p className="mt-2 text-muted-foreground">
        Усі товари в наявності у Львові
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <CatalogFilters
          brands={brands}
          categories={categories}
          priceBounds={priceBounds}
        />
        <div>
          <CatalogToolbar total={result.total} />
          <ProductGrid
            products={result.items}
            empty={
              <div className="rounded-lg border border-dashed p-10 text-center">
                <h2 className="text-lg font-medium">Товарів не знайдено</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {parsed.q
                    ? "Спробуйте інші ключові слова або скиньте фільтри."
                    : "Спробуйте змінити фільтри."}
                </p>
                <Link href="/katalog" className={cn(buttonVariants(), "mt-6 inline-flex")}>
                  Скинути фільтри
                </Link>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
