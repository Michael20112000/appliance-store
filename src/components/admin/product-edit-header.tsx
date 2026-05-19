import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { adminProductsUrl } from "@/lib/admin/products-url";
import type { SaveStatus } from "@/hooks/admin/use-product-auto-save";

type ProductEditHeaderProps = {
  categoryId: string | null;
  saveStatus: SaveStatus;
  deleteButton: React.ReactNode;
};

export function ProductEditHeader({
  categoryId,
  saveStatus,
  deleteButton,
}: ProductEditHeaderProps) {
  const backHref = categoryId
    ? adminProductsUrl({ categoryId })
    : adminProductsUrl();

  return (
    <header className="space-y-3">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Назад
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Редагувати товар</h1>
          <p
            className="min-h-5 text-sm text-muted-foreground transition-opacity duration-200"
            aria-live="polite"
          >
            {saveStatus === "saving" ? "Збереження…" : null}
            {saveStatus === "saved" ? "Збережено" : null}
          </p>
        </div>
        {deleteButton}
      </div>
    </header>
  );
}
