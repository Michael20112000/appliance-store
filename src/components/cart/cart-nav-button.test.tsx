/** @vitest-environment jsdom */
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

vi.mock("@/lib/cart/cart-events", () => ({
  CART_CHANGED_EVENT: "cart-changed",
}));

vi.mock("@/lib/cart/pending-storage", () => ({
  getPendingItemCount: vi.fn().mockReturnValue(0),
}));

import React from "react";
import { CartNavButton } from "@/components/cart/cart-nav-button";
import { useDrawers } from "@/lib/drawers/drawer-context";

describe("CartNavButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("CART-NAV-01: renders a button element (not an anchor/link)", () => {
    render(<CartNavButton initialCount={0} />);
    const btn = screen.getByRole("button", { name: /Кошик/ });
    expect(btn.tagName.toLowerCase()).toBe("button");
  });

  it("CART-NAV-02: button has aria-label 'Кошик' when initialCount is 0", () => {
    render(<CartNavButton initialCount={0} />);
    expect(screen.getByRole("button", { name: "Кошик" })).toBeDefined();
  });

  it("CART-NAV-03: button has aria-label 'Кошик, 2 товарів' when initialCount is 2", () => {
    render(<CartNavButton initialCount={2} />);
    expect(screen.getByRole("button", { name: "Кошик, 2 товарів" })).toBeDefined();
  });

  it("CART-NAV-04: clicking button calls openCart from useDrawers", () => {
    const openCartMock = vi.fn();
    vi.mocked(useDrawers).mockReturnValue({
      cartOpen: false,
      wishlistOpen: false,
      openCart: openCartMock,
      closeCart: vi.fn(),
      openWishlist: vi.fn(),
      closeWishlist: vi.fn(),
    });
    render(<CartNavButton initialCount={0} />);
    fireEvent.click(screen.getByRole("button", { name: "Кошик" }));
    expect(openCartMock.mock.calls.length).toBe(1);
  });

  it("CART-NAV-05: does not render badge when initialCount is 0", () => {
    render(<CartNavButton initialCount={0} />);
    expect(screen.queryByText("0")).toBeNull();
  });

  it("CART-NAV-06: renders badge with '3' when initialCount is 3", () => {
    render(<CartNavButton initialCount={3} />);
    expect(screen.getByText("3")).toBeDefined();
  });
});
