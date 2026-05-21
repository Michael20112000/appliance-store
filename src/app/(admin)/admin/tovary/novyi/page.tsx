import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";
import { listCategoriesAdmin } from "@/server/services/admin-catalog.service";

export const metadata: Metadata = {
  title: "Новий товар",
};

type PageProps = {
  searchParams: Promise<{ categoryId?: string }>;
};

export default async function AdminNewProductPage({ searchParams }: PageProps) {
  const { categoryId } = await searchParams;
  const categories = await listCategoriesAdmin();
  const defaultCategoryId =
    categoryId && categories.some((c) => c.id === categoryId)
      ? categoryId
      : categories[0]?.id;

  if (categories.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Новий товар</h1>
        <p className="text-sm text-muted-foreground">
          Спочатку створіть хоча б одну категорію в розділі «Категорії».
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Новий товар</h1>
      <ProductForm
        mode="create"
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
        }))}
        defaultValues={
          defaultCategoryId ? { categoryId: defaultCategoryId } : undefined
        }
      />
    </div>
  );
}
