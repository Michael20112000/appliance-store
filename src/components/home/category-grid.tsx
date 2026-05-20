import Link from "next/link";
import { categoriesWithAvailableProducts } from "@/lib/catalog/categories";
import { categoryImageAlt } from "@/lib/catalog/category-image-alt";
import { OptimizedImage } from "@/components/media/optimized-image";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCategoryCountBadge } from "@/lib/catalog/format";
import { listCategoriesWithProductCounts } from "@/server/services/catalog.service";

export async function CategoryGrid() {
  const { categories: categoriesWithCounts } =
    await listCategoriesWithProductCounts();
  const categories = categoriesWithAvailableProducts(categoriesWithCounts);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section id="kategorii" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="mb-6 text-2xl font-semibold">Категорії</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {categories.map((category) => {
          const imageAlt =
            category.imageAlt?.trim() || categoryImageAlt(category.name);

          return (
            <Link key={category.id} href={`/katalog/${category.slug}`}>
              <Card className="h-full overflow-hidden pt-0 transition-shadow hover:shadow-md">
                <div className="relative aspect-[4/3] min-h-48 w-full bg-muted">
                  {category.imagePublicId ? (
                    <OptimizedImage
                      src={category.imagePublicId}
                      alt={imageAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      Без фото
                    </div>
                  )}
                </div>
                <CardHeader>
                  <div className="flex min-w-0 items-center gap-2">
                    <CardTitle className="truncate text-base">
                      {category.name}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className={
                        category.productCount >= 2
                          ? "shrink-0 tabular-nums text-muted-foreground"
                          : "shrink-0 text-muted-foreground"
                      }
                    >
                      {formatCategoryCountBadge(category.productCount)}
                    </Badge>
                  </div>
                  <CardDescription>Переглянути</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
