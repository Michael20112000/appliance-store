/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { AdminCategoriesTable } from "./admin-categories-table";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/server/actions/admin/category.actions", () => ({
  reorderCategoriesAction: vi.fn().mockResolvedValue({ ok: true }),
  deleteCategoryFromListAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const twoCategories = [
  { id: "cat-1", name: "Перша", sortOrder: 1, productCount: 3 },
  { id: "cat-2", name: "Друга", sortOrder: 2, productCount: 0 },
];

describe("AdminCategoriesTable", () => {
  afterEach(() => {
    cleanup();
  });

  it("products link uses categoryId and does not trigger row edit navigation", () => {
    push.mockClear();

    render(<AdminCategoriesTable categories={[twoCategories[0]!]} />);

    const row = screen.getByText("Перша").closest("tr");
    expect(row).not.toBeNull();
    const link = row!.querySelector('a[href="/admin/tovary?categoryId=cat-1"]');
    expect(link).not.toBeNull();

    fireEvent.click(link!);
    expect(push).not.toHaveBeenCalledWith("/admin/kategorii/cat-1");

    push.mockClear();
    fireEvent.click(screen.getByText("Перша"));
    expect(push).toHaveBeenCalledWith("/admin/kategorii/cat-1");
  });

  it("shows row numbers 1 and 2 in local order", () => {
    const { container } = render(
      <AdminCategoriesTable categories={twoCategories} />,
    );
    const table = container.querySelector("table");
    expect(table).not.toBeNull();

    const bodyRows = table!.querySelectorAll("tbody tr");
    expect(bodyRows).toHaveLength(2);
    expect(bodyRows[0]?.querySelector("td")?.textContent).toBe("1");
    expect(bodyRows[1]?.querySelector("td")?.textContent).toBe("2");
  });

  it("add product link uses novyi with categoryId and does not navigate to edit", () => {
    push.mockClear();

    const { container } = render(
      <AdminCategoriesTable categories={[twoCategories[0]!]} />,
    );
    const table = container.querySelector("table")!;
    const row = within(table).getByText("Перша").closest("tr");
    const addLink = row!.querySelector(
      'a[href="/admin/tovary/novyi?categoryId=cat-1"]',
    );
    expect(addLink).not.toBeNull();

    fireEvent.click(addLink!);
    expect(push).not.toHaveBeenCalledWith("/admin/kategorii/cat-1");
  });

  it("delete button click does not trigger row edit navigation", () => {
    push.mockClear();

    const { container } = render(
      <AdminCategoriesTable categories={[twoCategories[0]!]} />,
    );
    const table = container.querySelector("table")!;
    const row = within(table).getByText("Перша").closest("tr")!;
    const deleteButton = within(row).getByRole("button", { name: "Видалити" });
    fireEvent.click(deleteButton);

    expect(push).not.toHaveBeenCalledWith("/admin/kategorii/cat-1");
  });
});
