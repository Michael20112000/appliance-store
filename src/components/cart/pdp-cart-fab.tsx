"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CART_CHANGED_EVENT } from "@/lib/cart/cart-events";
import { getPendingItemCount } from "@/lib/cart/pending-storage";
import { cn } from "@/lib/utils";
import { useDrawers } from "@/lib/drawers/drawer-context";

type PdpCartFabProps = {
  initialCount: number;
  hasSession: boolean;
};

export function PdpCartFab({ initialCount, hasSession }: PdpCartFabProps) {
  const [count, setCount] = useState(initialCount);
  const { openCart } = useDrawers();

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    if (hasSession) return;

    const sync = () => setCount(getPendingItemCount());
    sync();
    window.addEventListener(CART_CHANGED_EVENT, sync);
    return () => window.removeEventListener(CART_CHANGED_EVENT, sync);
  }, [hasSession]);

  if (count < 1) return null;

  const badgeLabel = count > 9 ? "9+" : String(count);

  return (
    <button
      type="button"
      className={cn(
        "fixed bottom-[5.75rem] right-6 z-[59] flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg",
        "pb-[max(0px,env(safe-area-inset-bottom))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
      aria-label="Відкрити кошик"
      onClick={openCart}
    >
      <ShoppingCart className="size-6" aria-hidden />
      <Badge
        className="absolute -right-0.5 -top-0.5 min-w-5 justify-center px-1 text-[10px]"
        aria-hidden
      >
        {badgeLabel}
      </Badge>
    </button>
  );
}
