/** @vitest-environment jsdom */
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCallbackNoteAutoSave } from "./use-callback-note-auto-save";

vi.mock("@/server/actions/admin/callback.actions", () => ({
  updateCallbackNoteAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { updateCallbackNoteAction } from "@/server/actions/admin/callback.actions";
import { toast } from "sonner";

describe("useCallbackNoteAutoSave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(updateCallbackNoteAction).mockReset();
    vi.mocked(updateCallbackNoteAction).mockResolvedValue({ ok: true });
    vi.mocked(toast.error).mockReset();
    vi.mocked(toast.success).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("debounces save until 400ms quiet", async () => {
    const { result } = renderHook(() =>
      useCallbackNoteAutoSave("id-1", "initial"),
    );

    await act(async () => {
      result.current.setValue("updated note");
    });

    await act(async () => {
      vi.advanceTimersByTime(399);
    });
    expect(updateCallbackNoteAction).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });

    expect(updateCallbackNoteAction).toHaveBeenCalledTimes(1);
    expect(updateCallbackNoteAction).toHaveBeenCalledWith({
      id: "id-1",
      note: "updated note",
    });
  });

  it("skips save when value equals initial snapshot", async () => {
    const { result } = renderHook(() =>
      useCallbackNoteAutoSave("id-1", "initial"),
    );

    await act(async () => {
      result.current.setValue("initial");
      vi.advanceTimersByTime(400);
      await Promise.resolve();
    });

    expect(updateCallbackNoteAction).not.toHaveBeenCalled();
  });

  it("shows ALREADY_ARCHIVED toast and keeps user value", async () => {
    vi.mocked(updateCallbackNoteAction).mockResolvedValue({
      ok: false,
      error: "ALREADY_ARCHIVED",
    });

    const { result } = renderHook(() =>
      useCallbackNoteAutoSave("id-1", "initial"),
    );

    await act(async () => {
      result.current.setValue("typed by user");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(toast.error).toHaveBeenCalledWith("Заявку вже в архіві");
    expect(result.current.value).toBe("typed by user");
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("shows NOT_FOUND toast on missing request", async () => {
    vi.mocked(updateCallbackNoteAction).mockResolvedValue({
      ok: false,
      error: "NOT_FOUND",
    });

    const { result } = renderHook(() =>
      useCallbackNoteAutoSave("id-1", "initial"),
    );

    await act(async () => {
      result.current.setValue("new text");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(toast.error).toHaveBeenCalledWith("Заявку не знайдено");
    expect(result.current.value).toBe("new text");
  });

  it("transitions saving to saved without success toast", async () => {
    const { result } = renderHook(() =>
      useCallbackNoteAutoSave("id-1", "initial"),
    );

    await act(async () => {
      result.current.setValue("saved note");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(result.current.status).toBe("saved");
    expect(toast.success).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.status).toBe("idle");
  });
});
