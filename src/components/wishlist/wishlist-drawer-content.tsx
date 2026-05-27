"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDrawers } from "@/lib/drawers/drawer-context";
import {
  getWishlistAction,
  resolveGuestWishlistProductsAction,
} from "@/server/actions/wishlist.actions";
import { WishlistGrid } from "./wishlist-grid";
import { ClearWishlistButton } from "./clear-wishlist-button";
import { WISHLIST_CHANGED_EVENT } from "@/lib/wishlist/wishlist-events";
import {
  getGuestWishlistProductIds,
  GUEST_WISHLIST_KEY,
} from "@/lib/wishlist/guest-storage";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WishlistLineDto } from "@/types/wishlist";

type WishlistDrawerContentProps = {
  hasSession: boolean;
};

export function WishlistDrawerContent({ hasSession }: WishlistDrawerContentProps) {
  const { wishlistOpen } = useDrawers();
  const [lines, setLines] = useState<WishlistLineDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!wishlistOpen) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        if (hasSession) {
          const result = await getWishlistAction();
          if (!cancelled) {
            setLines(result.lines);
            setLoading(false);
          }
        } else {
          const productIds = getGuestWishlistProductIds();
          if (productIds.length === 0) {
            if (!cancelled) {
              setLines([]);
              setLoading(false);
            }
            return;
          }
          const result = await resolveGuestWishlistProductsAction(productIds);
          if (!cancelled) {
            setLines(result.lines);
            setLoading(false);
          }
        }
      } catch {
        if (!cancelled) {
          setError("Не вдалося завантажити обране. Спробуйте оновити сторінку.");
          setLoading(false);
        }
      }
    }

    void load();

    if (!hasSession) {
      const onChanged = () => {
        void load();
      };
      const onStorage = (e: StorageEvent) => {
        if (e.key === GUEST_WISHLIST_KEY) void load();
      };
      window.addEventListener(WISHLIST_CHANGED_EVENT, onChanged);
      window.addEventListener("storage", onStorage);
      return () => {
        cancelled = true;
        window.removeEventListener(WISHLIST_CHANGED_EVENT, onChanged);
        window.removeEventListener("storage", onStorage);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [wishlistOpen, hasSession]);

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

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-12 text-center">
        <p className="text-muted-foreground">Обране порожнє</p>
        <Link
          href="/katalog"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          До каталогу
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <ClearWishlistButton hasSession={hasSession} />
      <WishlistGrid lines={lines} hasSession={hasSession} />
    </div>
  );
}
