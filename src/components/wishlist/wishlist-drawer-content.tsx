"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDrawers } from "@/lib/drawers/drawer-context";
import {
  getWishlistAction,
  resolveGuestWishlistProductsAction,
} from "@/server/actions/wishlist.actions";
import { ClearWishlistButton } from "./clear-wishlist-button";
import { GuestWishlistLineItem } from "./guest-wishlist-line-item";
import { WishlistLineItem } from "./wishlist-line-item";
import { WishlistUnavailableLineItem } from "./wishlist-unavailable-line-item";
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
  const { wishlistOpen, closeWishlist } = useDrawers();
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

    const onChanged = () => {
      void load();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === GUEST_WISHLIST_KEY) void load();
    };

    window.addEventListener(WISHLIST_CHANGED_EVENT, onChanged);
    if (!hasSession) {
      window.addEventListener("storage", onStorage);
    }

    return () => {
      cancelled = true;
      window.removeEventListener(WISHLIST_CHANGED_EVENT, onChanged);
      if (!hasSession) {
        window.removeEventListener("storage", onStorage);
      }
    };
  }, [wishlistOpen, hasSession]);

  function handleLineRemoved(productId: string) {
    setLines((prev) => prev.filter((line) => line.productId !== productId));
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

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-12 text-center">
        <p className="text-muted-foreground">Обране порожнє</p>
        <Link
          href="/katalog"
          className={cn(buttonVariants({ variant: "outline" }))}
          onClick={closeWishlist}
        >
          До каталогу
        </Link>
      </div>
    );
  }

  return (
    <>
      <ul className="divide-y divide-border">
        {lines.map((line) =>
          line.available ? (
            hasSession ? (
              <WishlistLineItem
                key={line.productId}
                line={line}
                onRemoved={() => handleLineRemoved(line.productId)}
                onNavigate={closeWishlist}
              />
            ) : (
              <GuestWishlistLineItem
                key={line.productId}
                line={line}
                onRemoved={() => handleLineRemoved(line.productId)}
                onNavigate={closeWishlist}
              />
            )
          ) : (
            <WishlistUnavailableLineItem
              key={line.productId}
              line={line}
              hasSession={hasSession}
              onRemoved={() => handleLineRemoved(line.productId)}
            />
          ),
        )}
      </ul>
      <div className="border-t p-4">
        <ClearWishlistButton
          hasSession={hasSession}
          onCleared={() => setLines([])}
        />
      </div>
    </>
  );
}
