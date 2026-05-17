import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/category-form";
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
      <h1 className="text-2xl font-semibold">Редагувати категорію</h1>
      <CategoryForm
        mode="edit"
        categoryId={category.id}
        defaultValues={{
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          sortOrder: category.sortOrder,
        }}
      />
    </div>
  );
}
