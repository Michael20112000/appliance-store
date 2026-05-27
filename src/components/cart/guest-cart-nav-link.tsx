"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CART_CHANGED_EVENT } from "@/lib/cart/cart-events";
import { getPendingItemCount } from "@/lib/cart/pending-storage";
import { useDrawers } from "@/lib/drawers/drawer-context";

export function GuestCartNavLink() {
  const [count, setCount] = useState(0);
  const { openCart } = useDrawers();

  useEffect(() => {
    const sync = () => setCount(getPendingItemCount());
    sync();
    window.addEventListener(CART_CHANGED_EVENT, sync);
    return () => window.removeEventListener(CART_CHANGED_EVENT, sync);
  }, []);

  return (
    <button
      type="button"
      className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-3 text-sm font-medium hover:bg-muted"
      aria-label={`Кошик${count > 0 ? `, ${count} товарів` : ""}`}
      onClick={openCart}
    >
      <ShoppingCart className="size-5" />
      {count > 0 ? (
        <Badge className="absolute -right-0.5 -top-0.5 min-w-5 justify-center px-1 text-[10px]">
          {count > 9 ? "9+" : count}
        </Badge>
      ) : null}
    </button>
  );
}
