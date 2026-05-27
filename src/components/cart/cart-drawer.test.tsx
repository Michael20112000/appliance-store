/** @vitest-environment jsdom */
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

vi.mock("@/lib/drawers/drawer-context", () => ({
  useDrawers: vi.fn().mockReturnValue({
    cartOpen: false,
    wishlistOpen: false,
    openCart: vi.fn(),
    closeCart: vi.fn(),
    openWishlist: vi.fn(),
    closeWishlist: vi.fn(),
  }),
}));

vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({
    open,
    onOpenChange,
    children,
  }: {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
  }) =>
    open
      ? React.createElement(
          "div",
          { "data-testid": "sheet" },
          React.createElement("button", {
            type: "button",
            "data-testid": "sheet-close-trigger",
            onClick: () => onOpenChange?.(false),
          }),
          children,
        )
      : null,
  SheetContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "sheet-content" }, children),
  SheetHeader: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  SheetTitle: ({ children }: { children: React.ReactNode }) =>
    React.createElement("h2", null, children),
  SheetClose: ({ render: r }: { render: React.ReactElement }) => r,
  SheetFooter: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
}));

vi.mock("@/components/cart/cart-drawer-content", () => ({
  CartDrawerContent: () =>
    React.createElement("div", { "data-testid": "cart-drawer-content" }),
}));

import { CartDrawer } from "@/components/cart/cart-drawer";
import { useDrawers } from "@/lib/drawers/drawer-context";

describe("CartDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("CART-DRW-01: renders nothing when cartOpen is false", () => {
    vi.mocked(useDrawers).mockReturnValue({
      cartOpen: false,
      wishlistOpen: false,
      openCart: vi.fn(),
      closeCart: vi.fn(),
      openWishlist: vi.fn(),
      closeWishlist: vi.fn(),
    });
    render(<CartDrawer />);
    expect(screen.queryByTestId("sheet")).toBeNull();
  });

  it("CART-DRW-02: renders sheet when cartOpen is true", () => {
    vi.mocked(useDrawers).mockReturnValue({
      cartOpen: true,
      wishlistOpen: false,
      openCart: vi.fn(),
      closeCart: vi.fn(),
      openWishlist: vi.fn(),
      closeWishlist: vi.fn(),
    });
    render(<CartDrawer />);
    expect(screen.getByTestId("sheet")).toBeDefined();
  });

  it("CART-DRW-03: calls closeCart when onOpenChange fires false", () => {
    const closeCartMock = vi.fn();
    vi.mocked(useDrawers).mockReturnValue({
      cartOpen: true,
      wishlistOpen: false,
      openCart: vi.fn(),
      closeCart: closeCartMock,
      openWishlist: vi.fn(),
      closeWishlist: vi.fn(),
    });
    render(<CartDrawer />);
    fireEvent.click(screen.getByTestId("sheet-close-trigger"));
    expect(closeCartMock).toHaveBeenCalledTimes(1);
  });

  it("CART-DRW-04: renders SheetTitle with text 'Кошик'", () => {
    vi.mocked(useDrawers).mockReturnValue({
      cartOpen: true,
      wishlistOpen: false,
      openCart: vi.fn(),
      closeCart: vi.fn(),
      openWishlist: vi.fn(),
      closeWishlist: vi.fn(),
    });
    render(<CartDrawer />);
    expect(screen.getByText("Кошик")).toBeDefined();
  });
});
