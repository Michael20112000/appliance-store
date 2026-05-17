import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addGuestWishlistProduct,
  clearGuestWishlist,
  GUEST_WISHLIST_KEY,
  GUEST_WISHLIST_MAX_ITEMS,
  getGuestWishlistCount,
  getGuestWishlistProductIds,
  hasGuestWishlistProduct,
  readGuestWishlist,
  removeGuestWishlistProduct,
} from "./guest-storage";
import { WISHLIST_CHANGED_EVENT } from "./wishlist-events";

describe("guest wishlist storage", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    });
    vi.stubGlobal("window", {
      dispatchEvent: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reads empty list when storage is missing", () => {
    expect(readGuestWishlist()).toEqual({ v: 1, items: [] });
    expect(getGuestWishlistCount()).toBe(0);
  });

  it("resets corrupt JSON to empty list", () => {
    store.set(GUEST_WISHLIST_KEY, "{not-json");
    expect(readGuestWishlist()).toEqual({ v: 1, items: [] });
  });

  it("adds, detects duplicate, and removes idempotently", () => {
    expect(addGuestWishlistProduct("prod-1")).toBe("added");
    expect(addGuestWishlistProduct("prod-1")).toBe("duplicate");
    expect(hasGuestWishlistProduct("prod-1")).toBe(true);
    expect(getGuestWishlistProductIds()).toEqual(["prod-1"]);
    expect(getGuestWishlistCount()).toBe(1);

    removeGuestWishlistProduct("prod-1");
    removeGuestWishlistProduct("prod-1");
    expect(hasGuestWishlistProduct("prod-1")).toBe(false);
    expect(getGuestWishlistCount()).toBe(0);
  });

  it("blocks adds beyond MAX_ITEMS", () => {
    for (let i = 0; i < GUEST_WISHLIST_MAX_ITEMS; i++) {
      expect(addGuestWishlistProduct(`prod-${i}`)).toBe("added");
    }
    expect(getGuestWishlistCount()).toBe(GUEST_WISHLIST_MAX_ITEMS);
    expect(addGuestWishlistProduct("prod-overflow")).toBe("max");
    expect(getGuestWishlistCount()).toBe(GUEST_WISHLIST_MAX_ITEMS);
  });

  it("trims stored list to max items on read", () => {
    const ids = Array.from({ length: 25 }, (_, i) => `prod-${i}`);
    store.set(
      GUEST_WISHLIST_KEY,
      JSON.stringify({ v: 1, items: ids.map((productId) => ({ productId })) }),
    );

    expect(getGuestWishlistCount()).toBe(20);
    expect(getGuestWishlistProductIds()).toHaveLength(20);
  });

  it("dispatches wishlist:changed after mutations", () => {
    const dispatchEvent = vi.mocked(window.dispatchEvent);
    addGuestWishlistProduct("prod-1");
    removeGuestWishlistProduct("prod-1");
    clearGuestWishlist();

    expect(dispatchEvent).toHaveBeenCalled();
    const events = dispatchEvent.mock.calls.map(([event]) => event);
    expect(
      events.every(
        (event) =>
          event instanceof CustomEvent &&
          event.type === WISHLIST_CHANGED_EVENT,
      ),
    ).toBe(true);
  });
});
