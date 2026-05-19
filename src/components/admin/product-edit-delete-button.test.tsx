/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ProductEditDeleteButton } from "./product-edit-delete-button";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/server/actions/admin/product.actions", () => ({
  deleteProductFromListAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { deleteProductFromListAction } from "@/server/actions/admin/product.actions";
import { toast } from "sonner";

describe("ProductEditDeleteButton", () => {
  it("opens AlertDialog and redirects with category filter on success", async () => {
    vi.mocked(deleteProductFromListAction).mockResolvedValue({ ok: true });
    push.mockReset();

    render(
      <ProductEditDeleteButton
        productId="clproductxxxxxxxxxxxxxxxxxx"
        categoryId="clcatxxxxxxxxxxxxxxxxxxxxxx"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Видалити товар" }));
    expect(screen.getByText("Видалити товар?")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Видалити" }));

    await waitFor(() => {
      expect(deleteProductFromListAction).toHaveBeenCalledWith(
        "clproductxxxxxxxxxxxxxxxxxx",
      );
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Товар видалено");
      expect(push).toHaveBeenCalledWith(
        "/admin/tovary?categoryId=clcatxxxxxxxxxxxxxxxxxxxxxx",
      );
    });
  });
});
