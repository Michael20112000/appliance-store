"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWatch, type Control } from "react-hook-form";
import { toast } from "sonner";
import { createDebounce } from "@/lib/debounce";
import { updateProductAction } from "@/server/actions/admin/product.actions";
import {
  editProductFormSchema,
  type UpsertProductInput,
} from "@/server/validators/admin-product";

export type SaveStatus = "idle" | "saving" | "saved";

const errorMessages: Record<string, string> = {
  PRODUCT_IN_CART:
    "Товар у кошику покупця — приберіть його з кошиків перед видаленням.",
  PRODUCT_IN_ACTIVE_ORDER:
    "Товар у активному замовленні — завершіть або скасуйте замовлення.",
  PRODUCT_NOT_FOUND: "Товар не знайдено.",
  UNKNOWN: "Не вдалося зберегти товар. Спробуйте ще раз.",
};

const SAVED_DISPLAY_MS = 2000;
const DEBOUNCE_MS = 500;

type UseProductAutoSaveOptions = {
  control: Control<UpsertProductInput>;
  productId: string;
  enabled: boolean;
  initialValues: UpsertProductInput;
};

export function useProductAutoSave({
  control,
  productId,
  enabled,
  initialValues,
}: UseProductAutoSaveOptions) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const snapshotRef = useRef("");
  const generationRef = useRef(0);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const debounceRef = useRef(createDebounce(DEBOUNCE_MS));
  const saveChainRef = useRef(Promise.resolve());
  const watchedValues = useWatch({ control });
  const watchedRef = useRef(watchedValues);
  watchedRef.current = watchedValues;

  useEffect(() => {
    const parsed = editProductFormSchema.safeParse(initialValues);
    if (parsed.success) {
      snapshotRef.current = JSON.stringify(parsed.data);
    }

    const debounce = debounceRef.current;
    return () => {
      debounce.cancel();
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
    };
  }, [initialValues]);

  const runSave = useCallback(() => {
    if (!enabled) return;

    saveChainRef.current = saveChainRef.current
      .then(async () => {
        const parsed = editProductFormSchema.safeParse(watchedRef.current);
        if (!parsed.success) return;

        const serialized = JSON.stringify(parsed.data);
        if (serialized === snapshotRef.current) return;

        const generation = ++generationRef.current;
        setStatus("saving");

        const result = await updateProductAction({
          id: productId,
          ...parsed.data,
        });

        if (generation !== generationRef.current) return;

        if (!result.ok) {
          toast.error(errorMessages[result.error] ?? errorMessages.UNKNOWN);
          setStatus("idle");
          return;
        }

        snapshotRef.current = serialized;
        setStatus("saved");
        if (savedTimeoutRef.current) {
          clearTimeout(savedTimeoutRef.current);
        }
        savedTimeoutRef.current = setTimeout(
          () => setStatus("idle"),
          SAVED_DISPLAY_MS,
        );
      })
      .catch(() => {
        setStatus("idle");
      });
  }, [enabled, productId]);

  const serializedWatch = JSON.stringify(watchedValues);

  useEffect(() => {
    if (!enabled) return;
    debounceRef.current(() => {
      runSave();
    });
  }, [enabled, serializedWatch, runSave]);

  const flush = useCallback(() => {
    debounceRef.current.flush();
  }, []);

  return { status, flush };
}
