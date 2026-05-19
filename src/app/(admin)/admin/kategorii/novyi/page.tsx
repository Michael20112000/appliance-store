import { CategoryForm } from "@/components/admin/category-form";
import { getCategoryCount } from "@/server/services/admin-catalog.service";

export default async function AdminNewCategoryPage() {
  const categoryCount = await getCategoryCount();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Нова категорія</h1>
      <CategoryForm
        mode="create"
        categoryCount={categoryCount}
        defaultValues={{ sortOrder: categoryCount + 1 }}
      />
    </div>
  );
}
