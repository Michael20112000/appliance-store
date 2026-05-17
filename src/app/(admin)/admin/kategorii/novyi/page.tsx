import { CategoryForm } from "@/components/admin/category-form";

export default function AdminNewCategoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Нова категорія</h1>
      <CategoryForm mode="create" />
    </div>
  );
}
