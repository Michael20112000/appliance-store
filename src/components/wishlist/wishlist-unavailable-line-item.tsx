"use client";

import { useTransition } from "react";
import { OptimizedImage } from "@/components/media/optimized-image";
import { Button } from "@/components/ui/button";
import { removeGuestWishlistProduct } from "@/lib/wishlist/guest-storage";
import { dispatchWishlistChanged } from "@/lib/wishlist/wishlist-events";
import { removeFromWishlistAction } from "@/server/actions/wishlist.actions";
import type { WishlistLineDto } from "@/types/wishlist";

type WishlistUnavailableLineItemProps = {
  line: WishlistLineDto;
  hasSession: boolean;
  onRemoved: () => void;
};

export function WishlistUnavailableLineItem({
  line,
  hasSession,
  onRemoved,
}: WishlistUnavailableLineItemProps) {
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    if (!hasSession) {
      removeGuestWishlistProduct(line.productId);
      onRemoved();
      return;
    }

    startTransition(async () => {
      await removeFromWishlistAction(line.productId);
      dispatchWishlistChanged();
      onRemoved();
    });
  }

  return (
    <li className="flex gap-4 border-b border-border py-4 opacity-60 last:border-b-0">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted sm:h-24 sm:w-24">
        {line.image ? (
          <OptimizedImage
            src={line.image.cloudinaryPublicId}
            alt={line.image.alt ?? line.title}
            fill
            className="object-cover grayscale"
            sizes="96px"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Без фото
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div>
          <p className="line-clamp-2 font-medium">{line.title}</p>
          <p className="text-sm text-muted-foreground">{line.brand}</p>
          <p className="text-sm text-muted-foreground">Товар більше недоступний</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          disabled={isPending}
          onClick={handleRemove}
        >
          {isPending ? "Видаляємо…" : "Видалити"}
        </Button>
      </div>
    </li>
  );
}
