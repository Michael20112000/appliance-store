import Link from "next/link";
import { ProductCard } from "@/components/catalog/product-card";
import { WishlistUnavailableCard } from "@/components/wishlist/wishlist-unavailable-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PublicProductCard } from "@/types/catalog";
import type { WishlistLineDto } from "@/types/wishlist";

type WishlistCabinetPreviewProps = {
  lines: WishlistLineDto[];
};

function toPublicProductCard(line: WishlistLineDto): PublicProductCard {
  return {
    id: line.productId,
    title: line.title,
    slug: line.slug,
    brand: line.brand,
    price: line.priceKopiyky,
    condition: line.condition,
    category: { name: "", slug: "" },
    previewImages: line.image ? [line.image] : [],
    image: line.image,
  };
}

export function WishlistCabinetPreview({ lines }: WishlistCabinetPreviewProps) {
  if (lines.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-muted-foreground">Поки нічого в обраному</p>
        <Link
          href="/katalog"
          className={cn(buttonVariants({ variant: "outline" }), "mt-4 inline-flex")}
        >
          Перейти до каталогу
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {lines.map((line) =>
          line.available ? (
            <ProductCard
              key={line.productId}
              product={toPublicProductCard(line)}
              hasSession
              initialInWishlist
            />
          ) : (
            <WishlistUnavailableCard
              key={line.productId}
              line={line}
              hasSession
            />
          ),
        )}
      </div>
      <Link
        href="/obrane"
        className={cn(buttonVariants({ variant: "outline" }), "mt-4 inline-flex")}
      >
        Дивитись усе
      </Link>
    </div>
  );
}
