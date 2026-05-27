"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  GUEST_WISHLIST_KEY,
  getGuestWishlistCount,
} from "@/lib/wishlist/guest-storage";
import { WISHLIST_CHANGED_EVENT } from "@/lib/wishlist/wishlist-events";
import { useDrawers } from "@/lib/drawers/drawer-context";

type WishlistNavLinkProps = {
  hasSession: boolean;
  initialCount?: number;
};

export function WishlistNavLink({
  hasSession,
  initialCount,
}: WishlistNavLinkProps) {
  const { openWishlist } = useDrawers();
  const [count, setCount] = useState(() =>
    hasSession ? (initialCount ?? 0) : 0,
  );

  useEffect(() => {
    if (hasSession) {
      setCount(initialCount ?? 0);
      return;
    }

    const syncGuestCount = () => setCount(getGuestWishlistCount());
    syncGuestCount();

    window.addEventListener(WISHLIST_CHANGED_EVENT, syncGuestCount);
    const onStorage = (event: StorageEvent) => {
      if (event.key === GUEST_WISHLIST_KEY) {
        syncGuestCount();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(WISHLIST_CHANGED_EVENT, syncGuestCount);
      window.removeEventListener("storage", onStorage);
    };
  }, [hasSession, initialCount]);

  const badgeLabel = count > 99 ? "99+" : String(count);
  const ariaLabel =
    count > 0
      ? `Обране, ${count} товарів`
      : "Обране";

  return (
    <button
      type="button"
      className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-3 text-sm font-medium hover:bg-muted"
      aria-label={ariaLabel}
      onClick={openWishlist}
    >
      <Heart className="size-5" />
      {count > 0 ? (
        <Badge className="absolute -right-0.5 -top-0.5 min-w-5 justify-center px-1 text-[10px]">
          {badgeLabel}
        </Badge>
      ) : null}
    </button>
  );
}
