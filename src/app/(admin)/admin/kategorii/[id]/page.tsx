import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/category-form";
import { Button } from "@/components/ui/button";
import { CategoryImageUpload } from "@/components/admin/category-image-upload";
import { getCategoryById } from "@/server/services/admin-catalog.service";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditCategoryPage({ params }: PageProps) {
  const { id } = await params;
  const category = await getCategoryById(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Редагувати категорію</h1>
        <Button
          size="sm"
          render={
            <Link href={`/admin/tovary/novyi?categoryId=${category.id}`} />
          }
        >
          Додати товар
        </Button>
      </div>
      <CategoryForm
        mode="edit"
        categoryId={category.id}
        defaultValues={{
          name: category.name,
          sortOrder: category.sortOrder,
        }}
      />

      <section
        aria-labelledby="category-image-heading"
        className="mt-8 space-y-6 border-t border-border pt-8"
      >
        <div className="space-y-2">
          <h2
            id="category-image-heading"
            className="text-lg font-semibold"
          >
            Зображення категорії
          </h2>
          <p className="text-sm text-muted-foreground">
            Показується на головній у блоці «Категорії». Одне фото на категорію.
          </p>
        </div>
        <CategoryImageUpload
          categoryId={category.id}
          categoryName={category.name}
          initialImagePublicId={category.imagePublicId ?? null}
        />
      </section>
    </div>
  );
}
