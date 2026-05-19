/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { StoreMobileNav } from "./store-mobile-nav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("@/server/actions/callback.actions", () => ({
  submitCallbackRequestAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

describe("StoreMobileNav", () => {
  it("renders category count badges and callback heading", () => {
    render(
      <StoreMobileNav
        categories={[
          { slug: "pralki", name: "Пральні машини", productCount: 3 },
          { slug: "holod", name: "Холодильники", productCount: 1 },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Меню" }));

    expect(screen.getByText("3")).toBeDefined();
    expect(screen.getByText("1")).toBeDefined();
    expect(
      screen.getByText("Вкажіть свій номер — ми передзвонимо"),
    ).toBeDefined();
  });
});
