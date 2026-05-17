import type { Metadata } from "next";
import Link from "next/link";
import { getCldImageUrl } from "next-cloudinary";
import { ProductListFilters } from "@/components/admin/product-list-filters";
import { ProductStatusBadge } from "@/components/admin/product-status-badge";
import { Button } from "@/components/ui/button";
import { formatPriceKopiyky } from "@/lib/catalog/format";
import { listCategoriesAdmin } from "@/server/services/admin-catalog.service";
import { listAdminProducts } from "@/server/services/admin-product.service";
import {
  listAdminProductsSchema,
  type ListAdminProductsFilters,
} from "@/server/validators/admin-product";
import type { ProductStatus } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Товари",
};

type PageProps = {
  searchParams: Promise<{
    page?: string;
    status?: string;
    categoryId?: string;
    q?: string;
  }>;
};

function parseListFilters(
  params: Awaited<PageProps["searchParams"]>,
): ListAdminProductsFilters {
  const status =
    params.status &&
    ["DRAFT", "AVAILABLE", "SOLD"].includes(params.status)
      ? (params.status as ProductStatus)
      : undefined;

  return listAdminProductsSchema.parse({
    page: params.page,
    status,
    categoryId: params.categoryId,
    q: params.q,
  });
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const filters = parseListFilters(rawParams);

  const [result, categories] = await Promise.all([
    listAdminProducts(filters),
    listCategoriesAdmin(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Товари</h1>
        <Button render={<Link href="/admin/tovary/novyi" />}>
          Додати товар
        </Button>
      </div>

      <ProductListFilters
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
        }))}
        activeStatus={filters.status}
        activeCategoryId={filters.categoryId}
      />

      {result.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Товарів не знайдено. Створіть перший товар або змініть фільтри.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
                <th className="px-3 py-2 font-medium">Фото</th>
                <th className="px-3 py-2 font-medium">Назва</th>
                <th className="px-3 py-2 font-medium">Категорія</th>
                <th className="px-3 py-2 font-medium">Ціна</th>
                <th className="px-3 py-2 font-medium">Статус</th>
                <th className="px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {result.items.map((product) => {
                const thumb = product.images[0];
                const thumbUrl = thumb
                  ? getCldImageUrl({
                      src: thumb.cloudinaryPublicId,
                      width: 72,
                      height: 72,
                      crop: "fill",
                    })
                  : null;

                return (
                  <tr
                    key={product.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-3 py-2">
                      {thumbUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumbUrl}
                          alt={thumb.alt ?? product.title}
                          width={72}
                          height={72}
                          className="size-[72px] rounded-md object-cover"
                        />
                      ) : (
                        <span className="inline-flex size-[72px] items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <p className="font-medium">{product.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.brand}
                      </p>
                    </td>
                    <td className="px-3 py-2">{product.category.name}</td>
                    <td className="px-3 py-2 tabular-nums">
                      {formatPriceKopiyky(product.price)}
                    </td>
                    <td className="px-3 py-2">
                      <ProductStatusBadge status={product.status} />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link
                        href={`/admin/tovary/${product.id}`}
                        className="text-primary hover:underline"
                      >
                        Редагувати
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {result.total > result.pageSize ? (
        <p className="text-xs text-muted-foreground">
          Показано {result.items.length} з {result.total} товарів
        </p>
      ) : null}
    </div>
  );
}
