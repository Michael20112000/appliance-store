"use client";

const KEY = "appliance-cart-pending";
const MAX_ITEMS = 20;

type PendingCart = {
  v: 1;
  items: { productId: string }[];
};

function readRaw(): PendingCart {
  if (typeof window === "undefined") {
    return { v: 1, items: [] };
  }

  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { v: 1, items: [] };
    const parsed = JSON.parse(raw) as PendingCart;
    if (parsed?.v !== 1 || !Array.isArray(parsed.items)) {
      return { v: 1, items: [] };
    }
    return parsed;
  } catch {
    return { v: 1, items: [] };
  }
}

function write(data: PendingCart) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function readPending(): PendingCart {
  return readRaw();
}

export function addPendingProduct(productId: string) {
  const data = readRaw();
  if (data.items.some((item) => item.productId === productId)) {
    return;
  }
  if (data.items.length >= MAX_ITEMS) {
    return;
  }
  data.items.push({ productId });
  write(data);
}

export function removePendingProduct(productId: string) {
  const data = readRaw();
  const next = data.items.filter((item) => item.productId !== productId);
  if (next.length === data.items.length) return;
  write({ v: 1, items: next });
}

export function hasPendingProduct(productId: string): boolean {
  return readRaw().items.some((item) => item.productId === productId);
}

export function clearPending() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
