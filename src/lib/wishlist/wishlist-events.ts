"use client";

export const WISHLIST_CHANGED_EVENT = "wishlist:changed";

export function dispatchWishlistChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(WISHLIST_CHANGED_EVENT));
}
