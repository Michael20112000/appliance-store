"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/server/actions/admin/category.actions";
import {
  upsertCategorySchema,
  type UpsertCategoryInput,
} from "@/server/validators/category";
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
  defaultValues?: Partial<UpsertCategoryInput>;
};

export function CategoryForm({
  mode,
  categoryId,
  defaultValues,
}: CategoryFormProps) {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<UpsertCategoryInput>({
    resolver: zodResolver(upsertCategorySchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      slug: defaultValues?.slug ?? "",
      description: defaultValues?.description ?? "",
      sortOrder: defaultValues?.sortOrder ?? 0,
    },
  });

  const slugPreview = form.watch("slug")?.trim();
  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);

    if (mode === "create") {
      const result = await createCategoryAction(values);
      if (result && !result.ok) {
        setError(errorMessages[result.error] ?? errorMessages.UNKNOWN);
      }
      return;
    }

    if (!categoryId) {
      setError(errorMessages.UNKNOWN);
      return;
    }

    const result = await updateCategoryAction({ id: categoryId, ...values });
    if (result && !result.ok) {
      setError(errorMessages[result.error] ?? errorMessages.UNKNOWN);
    }
  });

  const onDelete = async () => {
    if (!categoryId) return;
    if (
      !window.confirm(
        "Видалити категорію? Дію не можна скасувати, якщо в ній немає товарів.",
      )
    ) {
      return;
    }

    setError(null);
    const result = await deleteCategoryAction(categoryId);
    if (result && !result.ok) {
      setError(errorMessages[result.error] ?? errorMessages.UNKNOWN);
    }
  };

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

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" placeholder="автоматично з назви" {...form.register("slug")} />
        <p className="text-xs text-muted-foreground">
          Використовується в URL: /katalog/
          {slugPreview || "…"}
        </p>
        {form.formState.errors.slug ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.slug.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Опис</Label>
        <Input id="description" {...form.register("description")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sortOrder">Порядок</Label>
        <Input
          id="sortOrder"
          type="number"
          {...form.register("sortOrder", { valueAsNumber: true })}
        />
        {form.formState.errors.sortOrder ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.sortOrder.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Збереження…" : "Зберегти"}
        </Button>
        {mode === "edit" ? (
          <Button
            type="button"
            variant="destructive"
            disabled={isSubmitting}
            onClick={onDelete}
          >
            Видалити
          </Button>
        ) : null}
      </div>
    </form>
  );
}
