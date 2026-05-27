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

vi.mock("@/lib/wishlist/guest-storage", () => ({
  GUEST_WISHLIST_KEY: "guest-wishlist",
  getGuestWishlistCount: vi.fn().mockReturnValue(0),
}));

vi.mock("@/lib/wishlist/wishlist-events", () => ({
  WISHLIST_CHANGED_EVENT: "wishlist-changed",
}));

import React from "react";
import { WishlistNavLink } from "@/components/wishlist/wishlist-nav-link";
import { useDrawers } from "@/lib/drawers/drawer-context";

describe("WishlistNavLink", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("WLIST-NAV-01: renders a button element (not an anchor/link)", () => {
    render(<WishlistNavLink hasSession={false} initialCount={0} />);
    const btn = screen.getByRole("button", { name: /Обране/ });
    expect(btn.tagName.toLowerCase()).toBe("button");
  });

  it("WLIST-NAV-02: button has aria-label 'Обране' when count is 0", () => {
    render(<WishlistNavLink hasSession={false} initialCount={0} />);
    expect(screen.getByRole("button", { name: "Обране" })).toBeDefined();
  });

  it("WLIST-NAV-03: button has aria-label 'Обране, 2 товарів' when hasSession=true initialCount=2", () => {
    render(<WishlistNavLink hasSession={true} initialCount={2} />);
    expect(
      screen.getByRole("button", { name: "Обране, 2 товарів" }),
    ).toBeDefined();
  });

  it("WLIST-NAV-04: clicking button calls openWishlist from useDrawers", () => {
    const openWishlistMock = vi.fn();
    vi.mocked(useDrawers).mockReturnValue({
      cartOpen: false,
      wishlistOpen: false,
      openCart: vi.fn(),
      closeCart: vi.fn(),
      openWishlist: openWishlistMock,
      closeWishlist: vi.fn(),
    });
    render(<WishlistNavLink hasSession={false} initialCount={0} />);
    fireEvent.click(screen.getByRole("button", { name: "Обране" }));
    expect(openWishlistMock.mock.calls.length).toBe(1);
  });
});
