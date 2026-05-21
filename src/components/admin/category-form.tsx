"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCategoryAction } from "@/server/actions/admin/category.actions";
import {
  upsertCategorySchema,
  type UpsertCategoryInput,
} from "@/server/validators/category";
import {
  useCategoryAutoSave,
  type SaveStatus,
} from "@/hooks/admin/use-category-auto-save";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const errorMessages: Record<string, string> = {
  CATEGORY_HAS_PRODUCTS:
    "У категорії є товари. Спочатку перемістіть або видаліть їх.",
  CATEGORY_NOT_FOUND: "Категорію не знайдено.",
  UNKNOWN: "Не вдалося зберегти категорію. Спробуйте ще раз.",
};

type CategoryFormProps = {
  mode: "create" | "edit";
  categoryId?: string;
  categoryCount?: number;
  defaultValues?: Partial<UpsertCategoryInput>;
  onSaveStatusChange?: (status: SaveStatus) => void;
  onAutoSaveFlushReady?: (flush: () => void) => void;
};

export function CategoryForm({
  mode,
  categoryId,
  categoryCount = 0,
  defaultValues,
  onSaveStatusChange,
  onAutoSaveFlushReady,
}: CategoryFormProps) {
  const maxRank =
    mode === "create" ? Math.max(1, categoryCount + 1) : Math.max(1, categoryCount);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<UpsertCategoryInput>({
    resolver: zodResolver(upsertCategorySchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      sortOrder: defaultValues?.sortOrder ?? maxRank,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const initialValues: UpsertCategoryInput = {
    name: defaultValues?.name ?? "",
    sortOrder: defaultValues?.sortOrder ?? maxRank,
  };

  const { status, flush } = useCategoryAutoSave({
    control: form.control,
    categoryId: categoryId ?? "",
    enabled: mode === "edit",
    initialValues,
  });

  useEffect(() => {
    onSaveStatusChange?.(status);
  }, [status, onSaveStatusChange]);

  useEffect(() => {
    onAutoSaveFlushReady?.(flush);
  }, [flush, onAutoSaveFlushReady]);

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);

    if (mode === "create") {
      const result = await createCategoryAction(values);
      if (result && !result.ok) {
        setError(errorMessages[result.error] ?? errorMessages.UNKNOWN);
      }
      return;
    }
  });

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-6">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="name">Назва</Label>
        <Input id="name" {...form.register("name")} />
        {form.formState.errors.name ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        ) : null}
      </div>

      {mode === "create" ? (
        <p className="text-xs text-muted-foreground">
          Slug для URL згенерується автоматично з назви (наприклад, «Холодильники» →
          kholodylnyky).
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="sortOrder">Порядок</Label>
        <Input
          id="sortOrder"
          type="number"
          min={1}
          max={maxRank}
          step={1}
          inputMode="numeric"
          {...form.register("sortOrder", { valueAsNumber: true })}
        />
        <p className="text-xs text-muted-foreground">
          Від 1 до {maxRank}. Інші категорії зсунуться автоматично.
        </p>
        {form.formState.errors.sortOrder ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.sortOrder.message}
          </p>
        ) : null}
      </div>

      {mode === "create" ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Збереження…" : "Зберегти"}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
