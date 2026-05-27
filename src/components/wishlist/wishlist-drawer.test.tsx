/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

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
  Sheet: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? React.createElement("div", { "data-testid": "sheet" }, children) : null,
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

vi.mock("@/components/wishlist/wishlist-drawer-content", () => ({
  WishlistDrawerContent: () =>
    React.createElement("div", { "data-testid": "wishlist-drawer-content" }),
}));

import React from "react";
import { WishlistDrawer } from "@/components/wishlist/wishlist-drawer";
import { useDrawers } from "@/lib/drawers/drawer-context";

describe("WishlistDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("WLIST-DRW-01: renders nothing when wishlistOpen is false", () => {
    vi.mocked(useDrawers).mockReturnValue({
      cartOpen: false,
      wishlistOpen: false,
      openCart: vi.fn(),
      closeCart: vi.fn(),
      openWishlist: vi.fn(),
      closeWishlist: vi.fn(),
    });
    render(<WishlistDrawer />);
    expect(screen.queryByTestId("sheet")).toBeNull();
  });

  it("WLIST-DRW-02: renders sheet when wishlistOpen is true", () => {
    vi.mocked(useDrawers).mockReturnValue({
      cartOpen: false,
      wishlistOpen: true,
      openCart: vi.fn(),
      closeCart: vi.fn(),
      openWishlist: vi.fn(),
      closeWishlist: vi.fn(),
    });
    render(<WishlistDrawer />);
    expect(screen.getByTestId("sheet")).toBeDefined();
  });

  it("WLIST-DRW-03: renders SheetTitle with text 'Обране'", () => {
    vi.mocked(useDrawers).mockReturnValue({
      cartOpen: false,
      wishlistOpen: true,
      openCart: vi.fn(),
      closeCart: vi.fn(),
      openWishlist: vi.fn(),
      closeWishlist: vi.fn(),
    });
    render(<WishlistDrawer />);
    expect(screen.getByText("Обране")).toBeDefined();
  });
});
