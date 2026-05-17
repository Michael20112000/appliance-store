import Link from "next/link";
import { listCategoriesAdmin } from "@/server/services/admin-catalog.service";
import { Button } from "@/components/ui/button";

export default async function AdminCategoriesPage() {
  const categories = await listCategoriesAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Категорії</h1>
        <Button render={<Link href="/admin/kategorii/novyi" />}>
          Додати категорію
        </Button>
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">Немає категорій</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-2 font-medium">Назва</th>
                <th className="px-4 py-2 font-medium">Товарів</th>
                <th className="px-4 py-2 font-medium">Порядок</th>
                <th className="px-4 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-2">{category.name}</td>
                  <td className="px-4 py-2">{category._count.products}</td>
                  <td className="px-4 py-2">{category.sortOrder}</td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/admin/kategorii/${category.id}`}
                      className="text-primary hover:underline"
                    >
                      Редагувати
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
