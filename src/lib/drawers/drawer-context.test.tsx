/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import React from "react";
import { DrawerProvider, useDrawers } from "@/lib/drawers/drawer-context";

// TestConsumer renders state as data-testid attributes and exposes action buttons
function TestConsumer() {
  const {
    cartOpen,
    wishlistOpen,
    openCart,
    closeCart,
    openWishlist,
    closeWishlist,
  } = useDrawers();

  return (
    <div>
      <span data-testid="cart-open">{String(cartOpen)}</span>
      <span data-testid="wishlist-open">{String(wishlistOpen)}</span>
      <button onClick={openCart} data-testid="open-cart">
        Open Cart
      </button>
      <button onClick={closeCart} data-testid="close-cart">
        Close Cart
      </button>
      <button onClick={openWishlist} data-testid="open-wishlist">
        Open Wishlist
      </button>
      <button onClick={closeWishlist} data-testid="close-wishlist">
        Close Wishlist
      </button>
    </div>
  );
}

describe("DrawerProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("DRWR-CTX-01: cartOpen defaults to false", () => {
    render(
      <DrawerProvider>
        <TestConsumer />
      </DrawerProvider>,
    );
    expect(screen.getByTestId("cart-open").textContent).toBe("false");
  });

  it("DRWR-CTX-02: openCart sets cartOpen to true", () => {
    render(
      <DrawerProvider>
        <TestConsumer />
      </DrawerProvider>,
    );
    fireEvent.click(screen.getByTestId("open-cart"));
    expect(screen.getByTestId("cart-open").textContent).toBe("true");
  });

  it("DRWR-CTX-03: closeCart sets cartOpen to false after open", () => {
    render(
      <DrawerProvider>
        <TestConsumer />
      </DrawerProvider>,
    );
    fireEvent.click(screen.getByTestId("open-cart"));
    expect(screen.getByTestId("cart-open").textContent).toBe("true");
    fireEvent.click(screen.getByTestId("close-cart"));
    expect(screen.getByTestId("cart-open").textContent).toBe("false");
  });

  it("DRWR-CTX-04: wishlistOpen defaults to false", () => {
    render(
      <DrawerProvider>
        <TestConsumer />
      </DrawerProvider>,
    );
    expect(screen.getByTestId("wishlist-open").textContent).toBe("false");
  });

  it("DRWR-CTX-05: openWishlist sets wishlistOpen to true", () => {
    render(
      <DrawerProvider>
        <TestConsumer />
      </DrawerProvider>,
    );
    fireEvent.click(screen.getByTestId("open-wishlist"));
    expect(screen.getByTestId("wishlist-open").textContent).toBe("true");
  });

  it("DRWR-CTX-06: useDrawers throws outside DrawerProvider", () => {
    // Suppress React's error boundary console output during this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => {
      render(<TestConsumer />);
    }).toThrow(/DrawerProvider/);
    consoleSpy.mockRestore();
  });
});
