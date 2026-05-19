"use client";

import { useRef, useState } from "react";
import type { ProductCondition } from "@/generated/prisma/client";
import type { SaveStatus } from "@/hooks/admin/use-product-auto-save";
import type { UpsertProductInput } from "@/server/validators/admin-product";
import { ProductEditDeleteButton } from "@/components/admin/product-edit-delete-button";
import { ProductEditHeader } from "@/components/admin/product-edit-header";
import { ProductForm } from "@/components/admin/product-form";

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

type ProductEditPageContentProps = {
  productId: string;
  categoryId: string | null;
  categories: CategoryOption[];
  defaultValues: {
    title: string;
    description: string;
    brand: string;
    categoryId: string;
    condition: ProductCondition;
    priceUah: number;
    quantity: number;
  };
  images: ProductImageRow[];
};

export function ProductEditPageContent({
  productId,
  categoryId,
  categories,
  defaultValues,
  images,
}: ProductEditPageContentProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const flushRef = useRef<(() => void) | null>(null);

  const formDefaults: UpsertProductInput = {
    title: defaultValues.title,
    description: defaultValues.description,
    brand: defaultValues.brand,
    categoryId: defaultValues.categoryId,
    condition: defaultValues.condition,
    priceUah: defaultValues.priceUah,
    quantity: defaultValues.quantity,
  };

  return (
    <div className="space-y-8">
      <ProductEditHeader
        categoryId={categoryId}
        saveStatus={saveStatus}
        onNavigateBack={() => flushRef.current?.()}
        deleteButton={
          <ProductEditDeleteButton
            productId={productId}
            categoryId={categoryId}
          />
        }
      />
      <ProductForm
        mode="edit"
        productId={productId}
        categories={categories}
        defaultValues={formDefaults}
        images={images}
        onSaveStatusChange={setSaveStatus}
        onAutoSaveFlushReady={(flush) => {
          flushRef.current = flush;
        }}
      />
    </div>
  );
}
