/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CallbackRequestForm } from "./callback-request-form";

vi.mock("@/server/actions/callback.actions", () => ({
  submitCallbackRequestAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { submitCallbackRequestAction } from "@/server/actions/callback.actions";
import { toast } from "sonner";

describe("CallbackRequestForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows success toast and clears field on ok", async () => {
    vi.mocked(submitCallbackRequestAction).mockResolvedValue({ ok: true });

    render(<CallbackRequestForm />);

    const input = screen.getByLabelText("Номер телефону");
    fireEvent.change(input, { target: { value: "0978734712" } });
    fireEvent.click(screen.getByRole("button", { name: "Передзвоніть мені" }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Дякуємо, передзвонимо");
    });
    expect(toast.error).not.toHaveBeenCalled();
    expect((input as HTMLInputElement).value).toBe("");
  });

  it("shows inline error without toast.error on failure", async () => {
    vi.mocked(submitCallbackRequestAction).mockResolvedValue({
      ok: false,
      error: "RATE_LIMIT",
      message: "Занадто багато запитів. Спробуйте пізніше.",
    });

    render(<CallbackRequestForm />);

    fireEvent.change(screen.getByLabelText("Номер телефону"), {
      target: { value: "0978734712" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Передзвоніть мені" }));

    await waitFor(() => {
      expect(
        screen.getByText("Занадто багато запитів. Спробуйте пізніше."),
      ).toBeDefined();
    });
    expect(toast.error).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("FAB-03-a: typing partial number does NOT show validation error before submit", async () => {
    render(<CallbackRequestForm />);

    const input = screen.getByLabelText("Номер телефону");
    fireEvent.change(input, { target: { value: "097" } });

    // Wait for any async RHF state updates to settle, then assert no error appears
    await waitFor(() => {
      expect(screen.queryByRole("alert")).toBeNull();
    });
  });

  it("FAB-03-b: validation error appears after submit with too-short number", async () => {
    render(<CallbackRequestForm />);

    const input = screen.getByLabelText("Номер телефону");
    fireEvent.change(input, { target: { value: "097" } });
    fireEvent.click(screen.getByRole("button", { name: "Передзвоніть мені" }));

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert.textContent).toContain("Вкажіть номер телефону");
    });
    expect(vi.mocked(submitCallbackRequestAction).mock.calls.length).toBe(0);
  });
});
