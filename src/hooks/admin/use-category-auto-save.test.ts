/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UpsertCategoryInput } from "@/server/validators/category";
import { useCategoryAutoSave } from "./use-category-auto-save";

vi.mock("@/server/actions/admin/category.actions", () => ({
  updateCategoryAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { updateCategoryAction } from "@/server/actions/admin/category.actions";
import { toast } from "sonner";

const validValues: UpsertCategoryInput = {
  name: "Холодильники",
  sortOrder: 1,
};

function useAutoSaveHarness(
  overrides: Partial<{
    enabled: boolean;
    initialValues: UpsertCategoryInput;
  }> = {},
) {
  const form = useForm<UpsertCategoryInput>({
    defaultValues: overrides.initialValues ?? validValues,
  });

  const autoSave = useCategoryAutoSave({
    control: form.control,
    categoryId: "clcategoryxxxxxxxxxxxxxxxxx",
    enabled: overrides.enabled ?? true,
    initialValues: overrides.initialValues ?? validValues,
  });

  return { form, autoSave };
}

describe("useCategoryAutoSave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(updateCategoryAction).mockReset();
    vi.mocked(updateCategoryAction).mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("debounces save until 500ms quiet", async () => {
    const { result } = renderHook(() => useAutoSaveHarness());

    await act(async () => {
      result.current.form.setValue("name", "Пральні машини");
    });

    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    expect(updateCategoryAction).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(100);
      await Promise.resolve();
    });

    expect(updateCategoryAction).toHaveBeenCalledTimes(1);
  });

  it("skips network when schema validation fails (empty name)", async () => {
    const { result } = renderHook(() => useAutoSaveHarness());

    await act(async () => {
      result.current.form.setValue("name", "");
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(updateCategoryAction).not.toHaveBeenCalled();
  });

  it("skips save when snapshot unchanged after success", async () => {
    const { result } = renderHook(() => useAutoSaveHarness());

    await act(async () => {
      result.current.form.setValue("name", "Пральні машини");
    });
    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });
    expect(updateCategoryAction).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.form.setValue("name", "Пральні машини");
    });
    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(updateCategoryAction).toHaveBeenCalledTimes(1);
  });

  it("shows error toast and returns to idle on failed save without rolling back", async () => {
    vi.mocked(updateCategoryAction).mockResolvedValue({
      ok: false,
      error: "UNKNOWN",
    });
    const { result } = renderHook(() => useAutoSaveHarness());

    await act(async () => {
      result.current.form.setValue("name", "Пральні машини");
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Не вдалося зберегти категорію. Спробуйте ще раз.",
    );
    expect(result.current.autoSave.status).toBe("idle");
  });

  it("transitions status: idle → saving → saved → idle", async () => {
    let resolveAction!: (value: { ok: true }) => void;
    const actionPromise = new Promise<{ ok: true }>((resolve) => {
      resolveAction = resolve;
    });
    vi.mocked(updateCategoryAction).mockReturnValueOnce(actionPromise);

    const { result } = renderHook(() => useAutoSaveHarness());

    await act(async () => {
      result.current.form.setValue("name", "Пральні машини");
    });

    // trigger debounce
    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(result.current.autoSave.status).toBe("saving");

    // resolve action
    await act(async () => {
      resolveAction({ ok: true });
      await Promise.resolve();
    });

    expect(result.current.autoSave.status).toBe("saved");

    // advance past SAVED_DISPLAY_MS
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.autoSave.status).toBe("idle");
  });
});
