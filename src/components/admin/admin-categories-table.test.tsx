/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AdminCategoriesTable } from "./admin-categories-table";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("AdminCategoriesTable", () => {
  it("products link uses categoryId and does not trigger row edit navigation", () => {
    push.mockClear();

    render(
      <AdminCategoriesTable
        categories={[
          {
            id: "cat-1",
            name: "Test",
            sortOrder: 1,
            productCount: 3,
          },
        ]}
      />,
    );

    const row = screen.getByText("Test").closest("tr");
    expect(row).not.toBeNull();
    const link = row!.querySelector('a[href="/admin/tovary?categoryId=cat-1"]');
    expect(link).not.toBeNull();

    fireEvent.click(link!);
    expect(push).not.toHaveBeenCalledWith("/admin/kategorii/cat-1");

    push.mockClear();
    fireEvent.click(screen.getByText("Test"));
    expect(push).toHaveBeenCalledWith("/admin/kategorii/cat-1");
  });
});
