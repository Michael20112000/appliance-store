/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ProductListDeleteButton } from "./product-list-delete-button";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/server/actions/admin/product.actions", () => ({
  deleteProductFromListAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

describe("ProductListDeleteButton", () => {
  it("stopPropagation on delete button click and pointerdown (ADM-PRD-04)", () => {
    const parentClick = vi.fn();
    const parentPointerDown = vi.fn();

    render(
      <div onClick={parentClick} onPointerDown={parentPointerDown}>
        <ProductListDeleteButton productId="clxxxxxxxxxxxxxxxxxxxxxxxxx" />
      </div>,
    );

    const button = screen.getByRole("button", { name: "Видалити товар" });

    fireEvent.click(button);
    fireEvent.pointerDown(button);

    expect(parentClick).not.toHaveBeenCalled();
    expect(parentPointerDown).not.toHaveBeenCalled();
  });
});
