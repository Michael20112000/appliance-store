import Link from "next/link";
import { prisma } from "@/lib/db";
import { OptimizedImage } from "@/components/media/optimized-image";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export async function CategoryGrid() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <section id="kategorii" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="mb-6 text-2xl font-semibold">Категорії</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {categories.map((category) => {
          const imageAlt =
            category.imageAlt?.trim() ||
            `${category.name} — категорія, Львів`;

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
                  <CardTitle className="text-base">{category.name}</CardTitle>
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
