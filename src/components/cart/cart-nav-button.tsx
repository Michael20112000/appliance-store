"use client";

import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDrawers } from "@/lib/drawers/drawer-context";

type CartNavButtonProps = {
  initialCount: number;
};

export function CartNavButton({ initialCount }: CartNavButtonProps) {
  const { openCart } = useDrawers();

  return (
    <button
      type="button"
      onClick={openCart}
      className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-3 text-sm font-medium hover:bg-muted"
      aria-label={`Кошик${initialCount > 0 ? `, ${initialCount} товарів` : ""}`}
    >
      <ShoppingCart className="size-5" />
      {initialCount > 0 ? (
        <Badge className="absolute -right-0.5 -top-0.5 min-w-5 justify-center px-1 text-[10px]">
          {initialCount > 9 ? "9+" : initialCount}
        </Badge>
      ) : null}
    </button>
  );
}
