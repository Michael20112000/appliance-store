/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UpsertProductInput } from "@/server/validators/admin-product";
import { useProductAutoSave } from "./use-product-auto-save";

vi.mock("@/server/actions/admin/product.actions", () => ({
  updateProductAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { updateProductAction } from "@/server/actions/admin/product.actions";

const validValues: UpsertProductInput = {
  title: "Холодильник",
  description: "Опис",
  brand: "Samsung",
  categoryId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
  condition: "GOOD",
  priceUah: 1000,
  quantity: 1,
};

function useAutoSaveHarness(
  overrides: Partial<{
    enabled: boolean;
    initialValues: UpsertProductInput;
  }> = {},
) {
  const form = useForm<UpsertProductInput>({
    defaultValues: overrides.initialValues ?? validValues,
  });

  const autoSave = useProductAutoSave({
    control: form.control,
    productId: "clproductxxxxxxxxxxxxxxxxxx",
    enabled: overrides.enabled ?? true,
    initialValues: overrides.initialValues ?? validValues,
  });

  return { form, autoSave };
}

describe("useProductAutoSave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(updateProductAction).mockReset();
    vi.mocked(updateProductAction).mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("debounces save until 500ms quiet", async () => {
    const { result } = renderHook(() => useAutoSaveHarness());

    await act(async () => {
      result.current.form.setValue("title", "Нова назва");
    });

    await act(async () => {
      vi.advanceTimersByTime(499);
    });
    expect(updateProductAction).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });

    expect(updateProductAction).toHaveBeenCalledTimes(1);
  });

  it("skips network when validation fails", async () => {
    const { result } = renderHook(() => useAutoSaveHarness());

    await act(async () => {
      result.current.form.setValue("title", "");
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(updateProductAction).not.toHaveBeenCalled();
  });

  it("skips save when snapshot unchanged after success", async () => {
    const { result } = renderHook(() => useAutoSaveHarness());

    await act(async () => {
      result.current.form.setValue("title", "Нова назва");
    });
    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });
    expect(updateProductAction).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.form.setValue("title", "Нова назва");
    });
    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(updateProductAction).toHaveBeenCalledTimes(1);
  });

  it("serializes overlapping saves so later requests run after earlier ones finish", async () => {
    let resolveFirst: (value: { ok: true }) => void = () => {};
    const firstPromise = new Promise<{ ok: true }>((resolve) => {
      resolveFirst = resolve;
    });

    vi.mocked(updateProductAction)
      .mockReturnValueOnce(firstPromise)
      .mockResolvedValueOnce({ ok: true });

    const { result } = renderHook(() => useAutoSaveHarness());

    await act(async () => {
      result.current.form.setValue("title", "Перша зміна");
    });
    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });
    expect(updateProductAction).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.form.setValue("title", "Друга зміна");
    });
    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });
    expect(updateProductAction).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFirst({ ok: true });
      await Promise.resolve();
    });

    expect(updateProductAction).toHaveBeenCalledTimes(2);
    expect(vi.mocked(updateProductAction).mock.calls[1]?.[0]).toMatchObject({
      title: "Друга зміна",
    });
  });

  it("flush runs save before debounce elapses", async () => {
    const { result } = renderHook(() => useAutoSaveHarness());

    await act(async () => {
      result.current.form.setValue("brand", "LG");
    });

    await act(async () => {
      result.current.autoSave.flush();
      await Promise.resolve();
    });

    expect(updateProductAction).toHaveBeenCalledTimes(1);
  });
});
