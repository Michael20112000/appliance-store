"use client";

import Link from "next/link";
import { ConditionBadge } from "@/components/catalog/condition-badge";
import { PriceDisplay } from "@/components/catalog/price-display";
import { OptimizedImage } from "@/components/media/optimized-image";
import { Button } from "@/components/ui/button";
import { removeGuestWishlistProduct } from "@/lib/wishlist/guest-storage";
import type { WishlistLineDto } from "@/types/wishlist";

type GuestWishlistLineItemProps = {
  line: WishlistLineDto;
  onRemoved: () => void;
  onNavigate?: () => void;
};

export function GuestWishlistLineItem({
  line,
  onRemoved,
  onNavigate,
}: GuestWishlistLineItemProps) {
  return (
    <li className="flex gap-4 border-b border-border py-4 last:border-b-0">
      <Link
        href={`/tovar/${line.slug}`}
        className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted sm:h-24 sm:w-24"
        onClick={onNavigate}
      >
        {line.image ? (
          <OptimizedImage
            src={line.image.cloudinaryPublicId}
            alt={line.image.alt ?? line.title}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Без фото
          </span>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div>
          <Link
            href={`/tovar/${line.slug}`}
            className="line-clamp-2 font-medium hover:underline"
            onClick={onNavigate}
          >
            {line.title}
          </Link>
          <p className="text-sm text-muted-foreground">{line.brand}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PriceDisplay priceKopiyky={line.priceKopiyky} />
          <ConditionBadge condition={line.condition} />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => {
            removeGuestWishlistProduct(line.productId);
            onRemoved();
          }}
        >
          Видалити
        </Button>
      </div>
    </li>
  );
}
