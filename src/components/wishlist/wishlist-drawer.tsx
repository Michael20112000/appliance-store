"use client";

import { useDrawers } from "@/lib/drawers/drawer-context";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { WishlistDrawerContent } from "./wishlist-drawer-content";

type WishlistDrawerProps = {
  hasSession?: boolean;
};

export function WishlistDrawer({ hasSession = false }: WishlistDrawerProps) {
  const { wishlistOpen, closeWishlist } = useDrawers();

  return (
    <Sheet
      open={wishlistOpen}
      onOpenChange={(open) => {
        if (!open) closeWishlist();
      }}
    >
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="flex-row items-center justify-between border-b px-4 py-3">
          <SheetTitle>Обране</SheetTitle>
          <SheetClose render={<button type="button" aria-label="Закрити обране" />} />
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <WishlistDrawerContent hasSession={hasSession} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
