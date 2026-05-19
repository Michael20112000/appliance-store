"use client";

export const CART_CHANGED_EVENT = "cart:changed";

export function dispatchCartChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CART_CHANGED_EVENT));
}
