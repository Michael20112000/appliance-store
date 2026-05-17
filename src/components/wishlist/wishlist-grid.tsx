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
  const available = lines.filter((line) => line.available);
  const unavailable = lines.filter((line) => !line.available);

  return (
    <>
      {available.length > 0 ? (
        <section>
          <div className={gridClassName}>
            {available.map((line) => (
              <ProductCard
                key={line.productId}
                product={toPublicProductCard(line)}
                hasSession={hasSession}
                initialInWishlist
              />
            ))}
          </div>
        </section>
      ) : null}

      {unavailable.length > 0 ? (
        <section className={available.length > 0 ? "mt-10" : undefined}>
          {available.length > 0 ? (
            <h2 className="mb-4 text-lg font-medium">Недоступні</h2>
          ) : null}
          <div className={gridClassName}>
            {unavailable.map((line) => (
              <WishlistUnavailableCard
                key={line.productId}
                line={line}
                hasSession={hasSession}
              />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
