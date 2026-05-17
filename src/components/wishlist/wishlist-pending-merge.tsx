"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  clearGuestWishlist,
  readGuestWishlist,
} from "@/lib/wishlist/guest-storage";
import { mergePendingWishlistAction } from "@/server/actions/wishlist.actions";

export function WishlistPendingMerge() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const guest = readGuestWishlist();
    if (guest.items.length === 0) return;

    void mergePendingWishlistAction(guest.items)
      .then((result) => {
        clearGuestWishlist();
        if (result.merged > 0) {
          toast.success(
            result.merged === 1
              ? "1 товар з обраного додано до вашого акаунту"
              : `${result.merged} товарів з обраного додано до вашого акаунту`,
          );
        }
        router.refresh();
      })
      .catch(() => {
        clearGuestWishlist();
      });
  }, [router]);

  return null;
}
