"use client";

import Link from "next/link";
import { PriceDisplay } from "@/components/catalog/price-display";
import { ConditionBadge } from "@/components/catalog/condition-badge";
import { OptimizedImage } from "@/components/media/optimized-image";
import { Button } from "@/components/ui/button";
import { removePendingProduct } from "@/lib/cart/pending-storage";
import type { CartLineDto } from "@/types/cart";

type GuestCartLineItemProps = {
  line: CartLineDto;
  onRemoved: () => void;
};

export function GuestCartLineItem({ line, onRemoved }: GuestCartLineItemProps) {
  return (
    <li className="flex gap-4 border-b border-border py-4 last:border-b-0">
      <Link
        href={`/tovar/${line.slug}`}
        className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted sm:h-24 sm:w-24"
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
            removePendingProduct(line.productId);
            onRemoved();
          }}
        >
          Видалити
        </Button>
      </div>
    </li>
  );
}
