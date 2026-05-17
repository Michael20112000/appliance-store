import { ProductCard } from "@/components/catalog/product-card";
import { WishlistUnavailableCard } from "@/components/wishlist/wishlist-unavailable-card";
import type { PublicProductCard } from "@/types/catalog";
import type { WishlistLineDto } from "@/types/wishlist";

type WishlistGridProps = {
  lines: WishlistLineDto[];
  hasSession: boolean;
};

const gridClassName = "grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6";

function toPublicProductCard(line: WishlistLineDto): PublicProductCard {
  return {
    id: line.productId,
    title: line.title,
    slug: line.slug,
    brand: line.brand,
    price: line.priceKopiyky,
    condition: line.condition,
    category: { name: "", slug: "" },
    image: line.image,
  };
}

export function WishlistGrid({ lines, hasSession }: WishlistGridProps) {
  return (
    <div className={gridClassName}>
      {lines.map((line) =>
        line.available ? (
          <ProductCard
            key={line.productId}
            product={toPublicProductCard(line)}
            hasSession={hasSession}
            initialInWishlist
          />
        ) : (
          <WishlistUnavailableCard
            key={line.productId}
            line={line}
            hasSession={hasSession}
          />
        ),
      )}
    </div>
  );
}
