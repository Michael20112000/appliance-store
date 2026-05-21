/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CategoryTableDeleteButton } from "./category-table-delete-button";

vi.mock("@/server/actions/admin/category.actions", () => ({
  deleteCategoryFromListAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

describe("CategoryTableDeleteButton", () => {
  it("stopPropagation on delete button click and pointerdown", () => {
    const parentClick = vi.fn();
    const parentPointerDown = vi.fn();

    render(
      <div onClick={parentClick} onPointerDown={parentPointerDown}>
        <CategoryTableDeleteButton categoryId="cat-1" />
      </div>,
    );

    const button = screen.getByRole("button", { name: "Видалити" });

    fireEvent.click(button);
    fireEvent.pointerDown(button);

    expect(parentClick).not.toHaveBeenCalled();
    expect(parentPointerDown).not.toHaveBeenCalled();
  });
});
