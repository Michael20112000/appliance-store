"use client";

import { useRef, useState } from "react";
import type { SaveStatus } from "@/hooks/admin/use-category-auto-save";
import type { UpsertCategoryInput } from "@/server/validators/category";
import { CategoryEditDeleteButton } from "@/components/admin/category-edit-delete-button";
import { CategoryEditHeader } from "@/components/admin/category-edit-header";
import { CategoryForm } from "@/components/admin/category-form";

type CategoryEditPageContentProps = {
  categoryId: string;
  categoryCount: number;
  defaultValues: {
    name: string;
    sortOrder: number;
  };
};

export function CategoryEditPageContent({
  categoryId,
  categoryCount,
  defaultValues,
}: CategoryEditPageContentProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const flushRef = useRef<(() => void) | null>(null);

  const formDefaults: UpsertCategoryInput = {
    name: defaultValues.name,
    sortOrder: defaultValues.sortOrder,
  };

  return (
    <div className="space-y-8">
      <CategoryEditHeader
        saveStatus={saveStatus}
        categoryId={categoryId}
        onNavigateBack={() => flushRef.current?.()}
        deleteButton={<CategoryEditDeleteButton categoryId={categoryId} />}
      />
      <CategoryForm
        mode="edit"
        categoryId={categoryId}
        categoryCount={categoryCount}
        defaultValues={formDefaults}
        onSaveStatusChange={setSaveStatus}
        onAutoSaveFlushReady={(flush) => {
          flushRef.current = flush;
        }}
      />
    </div>
  );
}
