"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CartEmpty } from "@/components/cart/cart-empty";
import { CartSummary } from "@/components/cart/cart-summary";
import { GuestCartLineItem } from "@/components/cart/guest-cart-line-item";
import { GuestClearCartButton } from "@/components/cart/guest-clear-cart-button";
import { CART_CHANGED_EVENT } from "@/lib/cart/cart-events";
import { getPendingProductIds } from "@/lib/cart/pending-storage";
import { resolveGuestCartAction } from "@/server/actions/cart.actions";
import type { CartViewDto } from "@/types/cart";

export function GuestCartView() {
  const [cart, setCart] = useState<CartViewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const productIds = getPendingProductIds();
    if (productIds.length === 0) {
      setCart({ items: [], subtotalKopiyky: 0, removedTitles: [] });
      setLoading(false);
      return;
    }

    try {
      const result = await resolveGuestCartAction(productIds);
      setCart(result.cart);
    } catch {
      setError("Не вдалося завантажити кошик. Спробуйте оновити сторінку.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    window.addEventListener(CART_CHANGED_EVENT, load);
    return () => window.removeEventListener(CART_CHANGED_EVENT, load);
  }, [load]);

  if (loading) {
    return (
      <div className="mt-8">
        <p className="text-muted-foreground">Завантаження кошика…</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-8">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mt-8">
        <CartEmpty />
      </div>
    );
  }

  return (
    <>
      <div className="mt-6 flex justify-end">
        <GuestClearCartButton onCleared={load} />
      </div>

      {cart.removedTitles.length > 0 ? (
        <Alert className="mt-6">
          <AlertDescription>
            Деякі товари більше недоступні і були прибрані з кошика:{" "}
            {cart.removedTitles.join(", ")}.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
        <ul className="divide-y divide-border rounded-lg border border-border bg-card px-4">
          {cart.items.map((line) => (
            <GuestCartLineItem key={line.productId} line={line} onRemoved={load} />
          ))}
        </ul>
        <CartSummary
          subtotalKopiyky={cart.subtotalKopiyky}
          itemCount={cart.items.length}
        />
      </div>
    </>
  );
}
