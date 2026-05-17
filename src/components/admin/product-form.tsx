"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ProductCondition, ProductStatus } from "@/generated/prisma/client";
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/server/actions/admin/product.actions";
import {
  upsertProductSchema,
  type UpsertProductInput,
} from "@/server/validators/admin-product";
import { conditionLabelUa } from "@/lib/catalog/format";
import { ProductImageUpload } from "@/components/admin/product-image-upload";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CONDITIONS: ProductCondition[] = ["LIKE_NEW", "GOOD", "FAIR"];

const errorMessages: Record<string, string> = {
  PRODUCT_IN_CART:
    "Товар у кошику покупця — приберіть його з кошиків перед видаленням.",
  PRODUCT_IN_ACTIVE_ORDER:
    "Товар у активному замовленні — завершіть або скасуйте замовлення.",
  PRODUCT_NOT_FOUND: "Товар не знайдено.",
  UNKNOWN: "Не вдалося зберегти товар. Спробуйте ще раз.",
};

type CategoryOption = {
  id: string;
  name: string;
};

type ProductImageRow = {
  cloudinaryPublicId: string;
  alt: string | null;
  sortOrder: number;
  width: number | null;
  height: number | null;
};

type ProductFormProps = {
  mode: "create" | "edit";
  productId?: string;
  storefrontSlug?: string;
  currentStatus?: ProductStatus;
  categories: CategoryOption[];
  defaultValues?: Partial<UpsertProductInput>;
  images?: ProductImageRow[];
};

export function ProductForm({
  mode,
  productId,
  storefrontSlug,
  currentStatus,
  categories,
  defaultValues,
  images = [],
}: ProductFormProps) {
  const [error, setError] = useState<string | null>(null);
  const isSold = currentStatus === "SOLD";

  const form = useForm<UpsertProductInput>({
    resolver: zodResolver(upsertProductSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      slug: defaultValues?.slug ?? "",
      description: defaultValues?.description ?? "",
      brand: defaultValues?.brand ?? "",
      categoryId: defaultValues?.categoryId ?? categories[0]?.id ?? "",
      condition: defaultValues?.condition ?? "GOOD",
      status:
        defaultValues?.status ??
        (currentStatus === "AVAILABLE" ? "AVAILABLE" : "DRAFT"),
      priceUah: defaultValues?.priceUah ?? 0,
    },
  });

  const slugPreview = form.watch("slug")?.trim();
  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);

    if (mode === "create") {
      const result = await createProductAction(values);
      if (result && !result.ok) {
        setError(errorMessages[result.error] ?? errorMessages.UNKNOWN);
      }
      return;
    }

    if (!productId) {
      setError(errorMessages.UNKNOWN);
      return;
    }

    const result = await updateProductAction({ id: productId, ...values });
    if (result && !result.ok) {
      setError(errorMessages[result.error] ?? errorMessages.UNKNOWN);
    }
  });

  const onDelete = async () => {
    if (!productId) return;
    if (
      !window.confirm(
        "Видалити товар? Дію не можна скасувати, якщо товар не в кошику чи активному замовленні.",
      )
    ) {
      return;
    }

    setError(null);
    const result = await deleteProductAction(productId);
    if (result && !result.ok) {
      setError(errorMessages[result.error] ?? errorMessages.UNKNOWN);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {isSold ? (
          <Alert>
            <AlertDescription>
              Статус «Продано» встановлюється лише через замовлення. Редагування
              полів доступне, статус не змінюється.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Назва</Label>
            <Input id="title" {...form.register("title")} />
            {form.formState.errors.title ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            ) : null}
          </div>

          {mode === "create" ? (
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="автоматично з назви при створенні"
                {...form.register("slug")}
              />
              <p className="text-xs text-muted-foreground">
                URL: /tovar/{slugPreview || "…"}
              </p>
            </div>
          ) : storefrontSlug ? (
            <p className="text-xs text-muted-foreground sm:col-span-2">
              URL: /tovar/{storefrontSlug}
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="brand">Бренд</Label>
            <Input id="brand" {...form.register("brand")} />
            {form.formState.errors.brand ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.brand.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Категорія</Label>
            <select
              id="categoryId"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
              {...form.register("categoryId")}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">Стан</Label>
            <select
              id="condition"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
              {...form.register("condition")}
            >
              {CONDITIONS.map((condition) => (
                <option key={condition} value={condition}>
                  {conditionLabelUa(condition)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priceUah">Ціна (грн)</Label>
            <Input
              id="priceUah"
              type="number"
              min={1}
              step={1}
              className="tabular-nums"
              {...form.register("priceUah", { valueAsNumber: true })}
            />
            {form.formState.errors.priceUah ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.priceUah.message}
              </p>
            ) : null}
          </div>

          {!isSold ? (
            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <select
                id="status"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                {...form.register("status")}
              >
                <option value="DRAFT">Чернетка</option>
                <option value="AVAILABLE">В наявності</option>
              </select>
            </div>
          ) : null}

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Опис</Label>
            <textarea
              id="description"
              rows={5}
              className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
              {...form.register("description")}
            />
          </div>
        </div>

        <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-border bg-background px-4 py-4 sm:mx-0 sm:rounded-lg sm:border sm:px-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Збереження…" : "Зберегти"}
          </Button>
          <Button
            type="button"
            variant="outline"
            render={<Link href="/admin/tovary" />}
          >
            Скасувати
          </Button>
          {mode === "edit" && storefrontSlug && currentStatus !== "DRAFT" ? (
            <Button
              type="button"
              variant="outline"
              render={<Link href={`/tovar/${storefrontSlug}`} target="_blank" />}
            >
              На вітрині
            </Button>
          ) : null}
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

      {mode === "edit" && productId ? (
        <section className="max-w-2xl space-y-3 border-t border-border pt-8">
          <h2 className="text-lg font-semibold">Фото</h2>
          <ProductImageUpload productId={productId} initialImages={images} />
        </section>
      ) : null}
    </div>
  );
}
