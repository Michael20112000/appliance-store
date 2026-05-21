"use client";

import Link from "next/link";
import { ArrowLeft, Eye, Plus } from "lucide-react";
import type { SaveStatus } from "@/hooks/admin/use-category-auto-save";
import { Button } from "@/components/ui/button";

type CategoryEditHeaderProps = {
  saveStatus: SaveStatus;
  categoryId: string;
  deleteButton: React.ReactNode;
  onNavigateBack?: () => void;
};

export function CategoryEditHeader({
  saveStatus,
  categoryId,
  deleteButton,
  onNavigateBack,
}: CategoryEditHeaderProps) {
  return (
    <header className="space-y-3">
      <Link
        href="/admin/kategorii"
        onClick={onNavigateBack}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Назад
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Редагувати категорію</h1>
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

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          render={<Link href={`/admin/tovary?categoryId=${categoryId}`} />}
        >
          <Eye className="size-4" aria-hidden />
          Переглянути товари
        </Button>
        <Button
          size="sm"
          render={<Link href={`/admin/tovary/novyi?categoryId=${categoryId}`} />}
        >
          <Plus className="size-4" aria-hidden />
          Додати товар
        </Button>
      </div>
    </header>
  );
}
