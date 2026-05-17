import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogBrandParamGuard } from "@/components/catalog/catalog-brand-param-guard";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { CatalogFiltersSheet } from "@/components/catalog/catalog-filters-sheet";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { ProductGrid } from "@/components/catalog/product-grid";
import { buttonVariants } from "@/components/ui/button";
import {
  categoryMetadata,
  hasActiveCatalogFilters,
} from "@/lib/catalog/metadata";
import {
  catalogSearchParamsCache,
  parsersToFilters,
} from "@/lib/catalog/search-params";
import { cn } from "@/lib/utils";
import {
  getCatalogPriceBounds,
  getCategoryBySlug,
  getDistinctBrands,
  listCategories,
  listPublicProducts,
} from "@/server/services/catalog.service";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Категорію не знайдено" };

  const parsed = await catalogSearchParamsCache.parse(searchParams);
  const base = categoryMetadata(category);

  if (hasActiveCatalogFilters(parsed)) {
    return { ...base, robots: { index: false, follow: true } };
  }

  return base;
}

export default async function CategoryCatalogPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const parsed = await catalogSearchParamsCache.parse(searchParams);
  const filters = parsersToFilters(parsed);

  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const [categories, brands, priceBounds, result] = await Promise.all([
    listCategories(),
    getDistinctBrands(category.id),
    getCatalogPriceBounds(category.id),
    listPublicProducts({
      categoryId: category.id,
      filters,
      page: parsed.storinka,
      pageSize: 24,
      sort: parsed.sort,
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">{category.name}</h1>
      <p className="mt-2 text-muted-foreground">
        Б/у техніка у Львові — перевірений стан і чесна ціна.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <CatalogFilters
          brands={brands}
          categories={categories}
          activeCategorySlug={slug}
          priceBounds={priceBounds}
        />
        <div>
          <CatalogBrandParamGuard brands={brands} />
          <CatalogFiltersSheet
            brands={brands}
            categories={categories}
            activeCategorySlug={slug}
            priceBounds={priceBounds}
          />
          <CatalogToolbar total={result.total} />
          <ProductGrid
            products={result.items}
            empty={
              <div className="rounded-lg border border-dashed p-10 text-center">
                <h2 className="text-lg font-medium">
                  У цій категорії поки немає товарів
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Спробуйте інші ключові слова або скиньте фільтри.
                </p>
                <Link
                  href={`/katalog/${slug}`}
                  className={cn(buttonVariants(), "mt-6 inline-flex")}
                >
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
