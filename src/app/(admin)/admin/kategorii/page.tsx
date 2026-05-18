import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminCategoriesTable } from "@/components/admin/admin-categories-table";
import { listCategoriesAdmin } from "@/server/services/admin-catalog.service";
import { Button } from "@/components/ui/button";

export default async function AdminCategoriesPage() {
  const categories = await listCategoriesAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Категорії</h1>
        <Button render={<Link href="/admin/kategorii/novyi" />}>
          <Plus className="size-4" aria-hidden />
          Додати категорію
        </Button>
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">Немає категорій</p>
      ) : (
        <AdminCategoriesTable
          categories={categories.map((category) => ({
            id: category.id,
            name: category.name,
            sortOrder: category.sortOrder,
            productCount: category._count.products,
          }))}
        />
      )}
    </div>
  );
}
