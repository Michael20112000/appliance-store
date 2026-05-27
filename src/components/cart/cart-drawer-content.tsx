"use client";

import { useEffect, useState } from "react";
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
  const { cartOpen, closeCart } = useDrawers();
  const [cart, setCart] = useState<CartViewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cartOpen) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        if (hasSession) {
          const result = await getCartAction();
          if (!cancelled) setCart(result);
        } else {
          const productIds = getPendingProductIds();
          if (productIds.length === 0) {
            if (!cancelled) {
              setCart({ items: [], subtotalKopiyky: 0, removedTitles: [] });
            }
            return;
          }
          const result = await resolveGuestCartAction(productIds);
          if (!cancelled) setCart(result.cart);
        }
      } catch {
        if (!cancelled) {
          setError("Не вдалося завантажити кошик. Спробуйте оновити сторінку.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    const onChanged = () => {
      void load();
    };
    window.addEventListener(CART_CHANGED_EVENT, onChanged);

    if (!hasSession) {
      return () => {
        cancelled = true;
        window.removeEventListener(CART_CHANGED_EVENT, onChanged);
      };
    }

    return () => {
      cancelled = true;
      window.removeEventListener(CART_CHANGED_EVENT, onChanged);
    };
  }, [cartOpen, hasSession]);

  function handleRemoveLine(removedLine: { productId: string; priceKopiyky: number }) {
    setCart((prev) => {
      if (!prev) return prev;
      const nextItems = prev.items.filter((item) => item.productId !== removedLine.productId);
      return {
        ...prev,
        items: nextItems,
        subtotalKopiyky: Math.max(0, prev.subtotalKopiyky - removedLine.priceKopiyky),
      };
    });
  }

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
            <CartLineItem
              key={line.productId}
              line={line}
              onRemoved={handleRemoveLine}
              onNavigate={closeCart}
            />
          ))}
        </ul>
        <CartSummary
          subtotalKopiyky={cart.subtotalKopiyky}
          itemCount={cart.items.length}
          onCheckoutClick={closeCart}
        />
      </>
    );
  }

  return (
    <>
      <ul className="divide-y divide-border">
        {cart.items.map((line) => (
          <GuestCartLineItem
            key={line.productId}
            line={line}
            onRemoved={handleRemoveLine}
            onNavigate={closeCart}
          />
        ))}
      </ul>
      <GuestClearCartButton
        onCleared={() =>
          setCart((prev) => (prev ? { ...prev, items: [], subtotalKopiyky: 0 } : prev))
        }
      />
      <CartSummary
        subtotalKopiyky={cart.subtotalKopiyky}
        itemCount={cart.items.length}
        onCheckoutClick={closeCart}
      />
    </>
  );
}
