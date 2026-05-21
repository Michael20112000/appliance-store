/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CategoryEditDeleteButton } from "./category-edit-delete-button";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/server/actions/admin/category.actions", () => ({
  deleteCategoryFromListAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { deleteCategoryFromListAction } from "@/server/actions/admin/category.actions";
import { toast } from "sonner";

describe("CategoryEditDeleteButton", () => {
  afterEach(() => {
    cleanup();
  });

  it("opens AlertDialog and calls deleteCategoryFromListAction on confirm then redirects on success", async () => {
    vi.mocked(deleteCategoryFromListAction).mockResolvedValue({ ok: true });
    push.mockReset();

    render(<CategoryEditDeleteButton categoryId="clcategoryxxxxxxxxxxxxxxxxx" />);

    fireEvent.click(
      screen.getByRole("button", { name: "Видалити категорію" }),
    );
    expect(screen.getByText("Видалити категорію?")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Видалити" }));

    await waitFor(() => {
      expect(deleteCategoryFromListAction).toHaveBeenCalledWith(
        "clcategoryxxxxxxxxxxxxxxxxx",
      );
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Категорію видалено");
      expect(push).toHaveBeenCalledWith("/admin/kategorii");
    });
  });

  it("shows error toast and does not redirect on failure", async () => {
    vi.mocked(deleteCategoryFromListAction).mockResolvedValue({
      ok: false,
      error: "CATEGORY_HAS_PRODUCTS",
    });
    push.mockReset();

    render(<CategoryEditDeleteButton categoryId="clcategoryxxxxxxxxxxxxxxxxx" />);

    fireEvent.click(
      screen.getByRole("button", { name: "Видалити категорію" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Видалити" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "У категорії є товари. Спочатку перемістіть або видаліть їх.",
      );
    });

    expect(push).not.toHaveBeenCalled();
  });

  it("does not call deleteCategoryFromListAction when cancel is clicked", async () => {
    vi.mocked(deleteCategoryFromListAction).mockReset();
    push.mockReset();

    render(<CategoryEditDeleteButton categoryId="clcategoryxxxxxxxxxxxxxxxxx" />);

    fireEvent.click(
      screen.getByRole("button", { name: "Видалити категорію" }),
    );
    expect(screen.getByText("Видалити категорію?")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Скасувати" }));

    expect(deleteCategoryFromListAction).not.toHaveBeenCalled();
  });
});
