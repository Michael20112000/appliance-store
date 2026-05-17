"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import {
  addGuestWishlistProduct,
  hasGuestWishlistProduct,
  removeGuestWishlistProduct,
} from "@/lib/wishlist/guest-storage";
import {
  addToWishlistAction,
  removeFromWishlistAction,
} from "@/server/actions/wishlist.actions";
import { Button } from "@/components/ui/button";
import { WISHLIST_CHANGED_EVENT } from "@/lib/wishlist/wishlist-events";
import { cn } from "@/lib/utils";

type WishlistToggleButtonProps = {
  productId: string;
  productTitle: string;
  hasSession: boolean;
  initialInWishlist?: boolean;
  variant: "overlay" | "inline";
};

export function WishlistToggleButton({
  productId,
  productTitle,
  hasSession,
  initialInWishlist = false,
  variant,
}: WishlistToggleButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [inWishlist, setInWishlist] = useState(() =>
    hasSession
      ? initialInWishlist
      : typeof window !== "undefined" && hasGuestWishlistProduct(productId),
  );

  useEffect(() => {
    if (hasSession) {
      setInWishlist(initialInWishlist);
    }
  }, [hasSession, initialInWishlist]);

  useEffect(() => {
    if (hasSession) return;
    const syncGuestState = () => {
      setInWishlist(hasGuestWishlistProduct(productId));
    };
    window.addEventListener(WISHLIST_CHANGED_EVENT, syncGuestState);
    return () => {
      window.removeEventListener(WISHLIST_CHANGED_EVENT, syncGuestState);
    };
  }, [hasSession, productId]);

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (inWishlist) {
      if (!hasSession) {
        removeGuestWishlistProduct(productId);
        setInWishlist(false);
        toast.success("Прибрано з обраного");
        return;
      }

      startTransition(async () => {
        const previous = true;
        setInWishlist(false);
        const result = await removeFromWishlistAction(productId);
        if (!result.ok) {
          setInWishlist(previous);
          toast.error("Не вдалося оновити обране");
          return;
        }
        toast.success("Прибрано з обраного");
        router.refresh();
      });
      return;
    }

    if (!hasSession) {
      const result = addGuestWishlistProduct(productId);
      if (result === "max") {
        toast.error("У обраному вже максимум 20 товарів");
        return;
      }
      if (result === "duplicate") {
        setInWishlist(true);
        return;
      }
      setInWishlist(true);
      toast.success("Додано до обраного");
      return;
    }

    startTransition(async () => {
      setInWishlist(true);
      const result = await addToWishlistAction(productId);
      if (!result.ok) {
        setInWishlist(false);
        if (result.error === "WISHLIST_MAX") {
          toast.error("У обраному вже максимум 20 товарів");
          return;
        }
        toast.error("Не вдалося оновити обране");
        return;
      }
      toast.success("Додано до обраного");
      router.refresh();
    });
  };

  const label = inWishlist
    ? `Прибрати ${productTitle} з обраного`
    : `Додати ${productTitle} до обраного`;

  if (variant === "overlay") {
    return (
      <Button
        type="button"
        size="icon"
        variant="secondary"
        className={cn(
          "absolute right-2 top-2 z-10 bg-background/90 shadow-sm",
          inWishlist && "text-destructive",
        )}
        disabled={isPending}
        onClick={handleClick}
        aria-pressed={inWishlist}
        aria-label={label}
      >
        <Heart className={cn("size-4", inWishlist && "fill-current")} />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="min-h-11 w-full sm:w-auto"
      disabled={isPending}
      onClick={handleClick}
      aria-pressed={inWishlist}
      aria-label={label}
    >
      <Heart
        className={cn("mr-2 size-4", inWishlist && "fill-current text-destructive")}
      />
      {inWishlist ? "У обраному" : "Додати до обраного"}
    </Button>
  );
}
