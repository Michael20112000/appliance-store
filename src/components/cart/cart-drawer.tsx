"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useDrawers } from "@/lib/drawers/drawer-context";
import { CartDrawerContent } from "./cart-drawer-content";

type CartDrawerProps = {
  hasSession?: boolean;
};

export function CartDrawer({ hasSession = false }: CartDrawerProps) {
  const { cartOpen, closeCart } = useDrawers();

  return (
    <Sheet
      open={cartOpen}
      onOpenChange={(open) => {
        if (!open) closeCart();
      }}
    >
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="flex-row items-center justify-between border-b px-4 py-3">
          <SheetTitle>Кошик</SheetTitle>
          <SheetClose
            render={
              <button type="button" aria-label="Закрити кошик" />
            }
          />
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <CartDrawerContent hasSession={hasSession} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
