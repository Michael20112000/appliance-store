"use client";

import { dispatchWishlistChanged } from "@/lib/wishlist/wishlist-events";

export const GUEST_WISHLIST_KEY = "appliance-wishlist-guest";
export const GUEST_WISHLIST_MAX_ITEMS = 20;

export type GuestWishlist = {
  v: 1;
  items: { productId: string }[];
};

export type GuestWishlistAddResult = "added" | "duplicate" | "max";

function readRaw(): GuestWishlist {
  if (typeof window === "undefined") {
    return { v: 1, items: [] };
  }

  try {
    const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
    if (!raw) return { v: 1, items: [] };
    const parsed = JSON.parse(raw) as GuestWishlist;
    if (parsed?.v !== 1 || !Array.isArray(parsed.items)) {
      return { v: 1, items: [] };
    }
    return parsed;
  } catch {
    return { v: 1, items: [] };
  }
}

function write(data: GuestWishlist) {
  localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(data));
}

export function readGuestWishlist(): GuestWishlist {
  return readRaw();
}

export function addGuestWishlistProduct(
  productId: string,
): GuestWishlistAddResult {
  const data = readRaw();
  if (data.items.some((item) => item.productId === productId)) {
    return "duplicate";
  }
  if (data.items.length >= GUEST_WISHLIST_MAX_ITEMS) {
    return "max";
  }
  data.items.push({ productId });
  write(data);
  dispatchWishlistChanged();
  return "added";
}

export function removeGuestWishlistProduct(productId: string) {
  const data = readRaw();
  const next = data.items.filter((item) => item.productId !== productId);
  if (next.length === data.items.length) return;
  write({ v: 1, items: next });
  dispatchWishlistChanged();
}

export function hasGuestWishlistProduct(productId: string): boolean {
  return readRaw().items.some((item) => item.productId === productId);
}

export function getGuestWishlistProductIds(): string[] {
  return readRaw().items.map((item) => item.productId);
}

export function getGuestWishlistCount(): number {
  return readRaw().items.length;
}

export function clearGuestWishlist() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_WISHLIST_KEY);
  dispatchWishlistChanged();
}
