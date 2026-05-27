"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CartEmpty } from "@/components/cart/cart-empty";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { GuestCartLineItem } from "@/components/cart/guest-cart-line-item";
import { GuestClearCartButton } from "@/components/cart/guest-clear-cart-button";
import { CART_CHANGED_EVENT } from "@/lib/cart/cart-events";
import { useDrawers } from "@/lib/drawers/drawer-context";
import { getPendingProductIds } from "@/lib/cart/pending-storage";
import {
  getCartAction,
  resolveGuestCartAction,
} from "@/server/actions/cart.actions";
import type { CartViewDto } from "@/types/cart";

type CartDrawerContentProps = {
  hasSession: boolean;
};

export function CartDrawerContent({ hasSession }: CartDrawerContentProps) {
  const { cartOpen } = useDrawers();
  const [cart, setCart] = useState<CartViewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (hasSession) {
        const result = await getCartAction();
        setCart(result);
      } else {
        const productIds = getPendingProductIds();
        if (productIds.length === 0) {
          setCart({ items: [], subtotalKopiyky: 0, removedTitles: [] });
          setLoading(false);
          return;
        }
        const result = await resolveGuestCartAction(productIds);
        setCart(result.cart);
      }
    } catch {
      setError("Не вдалося завантажити кошик. Спробуйте оновити сторінку.");
    } finally {
      setLoading(false);
    }
  }, [hasSession]);

  useEffect(() => {
    if (!cartOpen) return;

    void load();

    if (!hasSession) {
      window.addEventListener(CART_CHANGED_EVENT, load);
      return () => window.removeEventListener(CART_CHANGED_EVENT, load);
    }
  }, [cartOpen, hasSession, load]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Завантаження...
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (cart === null) {
    return null;
  }

  if (cart.items.length === 0) {
    return <CartEmpty />;
  }

  if (hasSession) {
    return (
      <>
        <ul className="divide-y divide-border">
          {cart.items.map((line) => (
            <CartLineItem key={line.productId} line={line} />
          ))}
        </ul>
        <CartSummary
          subtotalKopiyky={cart.subtotalKopiyky}
          itemCount={cart.items.length}
        />
      </>
    );
  }

  return (
    <>
      <ul className="divide-y divide-border">
        {cart.items.map((line) => (
          <GuestCartLineItem key={line.productId} line={line} onRemoved={load} />
        ))}
      </ul>
      <GuestClearCartButton onCleared={load} />
      <CartSummary
        subtotalKopiyky={cart.subtotalKopiyky}
        itemCount={cart.items.length}
      />
    </>
  );
}
