"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWatch, type Control } from "react-hook-form";
import { toast } from "sonner";
import { createDebounce } from "@/lib/debounce";
import { updateCategoryAction } from "@/server/actions/admin/category.actions";
import {
  upsertCategorySchema,
  type UpsertCategoryInput,
} from "@/server/validators/category";

export type SaveStatus = "idle" | "saving" | "saved";

const errorMessages: Record<string, string> = {
  CATEGORY_HAS_PRODUCTS:
    "У категорії є товари. Спочатку перемістіть або видаліть їх.",
  CATEGORY_NOT_FOUND: "Категорію не знайдено.",
  UNKNOWN: "Не вдалося зберегти категорію. Спробуйте ще раз.",
};

const SAVED_DISPLAY_MS = 2000;
const DEBOUNCE_MS = 500;

type UseCategoryAutoSaveOptions = {
  control: Control<UpsertCategoryInput>;
  categoryId: string;
  enabled: boolean;
  initialValues: UpsertCategoryInput;
};

export function useCategoryAutoSave({
  control,
  categoryId,
  enabled,
  initialValues,
}: UseCategoryAutoSaveOptions) {
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
    const parsed = upsertCategorySchema.safeParse(initialValues);
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
        const parsed = upsertCategorySchema.safeParse(watchedRef.current);
        if (!parsed.success) return;

        const serialized = JSON.stringify(parsed.data);
        if (serialized === snapshotRef.current) return;

        const generation = ++generationRef.current;
        setStatus("saving");

        const result = await updateCategoryAction({
          id: categoryId,
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
  }, [enabled, categoryId]);

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
