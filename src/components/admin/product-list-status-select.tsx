"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { ProductStatus } from "@/generated/prisma/client";
import { toast } from "sonner";
import { PRODUCT_STATUS_LABELS } from "@/lib/admin/product-status-labels";
import { updateProductStatusAction } from "@/server/actions/admin/product.actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const errorMessages: Record<string, string> = {
  PRODUCT_STATUS_LOCKED: "Статус «Продано» змінюється лише через замовлення.",
  PRODUCT_NOT_FOUND: "Товар не знайдено.",
  UNKNOWN: "Не вдалося оновити статус. Спробуйте ще раз.",
};

type ProductListStatusSelectProps = {
  productId: string;
  status: ProductStatus;
};

const EDITABLE_STATUSES = ["DRAFT", "AVAILABLE"] as const;

export function ProductListStatusSelect({
  productId,
  status,
}: ProductListStatusSelectProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (status === "SOLD") {
    return (
      <Select value={status} disabled>
        <SelectTrigger
          size="sm"
          className="w-[10.5rem]"
          onClick={(event) => event.stopPropagation()}
        >
          <SelectValue>{PRODUCT_STATUS_LABELS.SOLD}</SelectValue>
        </SelectTrigger>
      </Select>
    );
  }

  const options = EDITABLE_STATUSES.filter((value) => value !== status);

  function handleSelect(value: string | null) {
    if (!value || value === status) return;
    if (value !== "DRAFT" && value !== "AVAILABLE") return;

    startTransition(async () => {
      const result = await updateProductStatusAction({
        productId,
        status: value,
      });
      if (!result.ok) {
        toast.error(errorMessages[result.error] ?? errorMessages.UNKNOWN);
        return;
      }
      toast.success("Статус оновлено");
      router.refresh();
    });
  }

  return (
    <Select value={status} onValueChange={handleSelect} disabled={pending}>
      <SelectTrigger
        size="sm"
        className="w-[10.5rem]"
        onClick={(event) => event.stopPropagation()}
      >
        <SelectValue>{PRODUCT_STATUS_LABELS[status]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={status}>
          {PRODUCT_STATUS_LABELS[status]} (поточний)
        </SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {PRODUCT_STATUS_LABELS[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
