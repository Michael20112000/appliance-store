import { notFound } from "next/navigation";
import { CategoryEditPageContent } from "@/components/admin/category-edit-page-content";
import { CategoryImageUpload } from "@/components/admin/category-image-upload";
import {
  getCategoryById,
  getCategoryCount,
} from "@/server/services/admin-catalog.service";

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
      <CategoryEditPageContent
        categoryId={category.id}
        defaultValues={{
          name: category.name,
          sortOrder: category.sortOrder,
        }}
        categoryCount={await getCategoryCount()}
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
