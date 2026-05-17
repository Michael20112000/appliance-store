import { ProductCard } from "@/components/catalog/product-card";
import type { PublicProductCard } from "@/types/catalog";

type ProductGridProps = {
  products: PublicProductCard[];
  empty?: React.ReactNode;
  hasSession?: boolean;
  wishlistedProductIds?: Set<string>;
};

export function ProductGrid({
  products,
  empty,
  hasSession = false,
  wishlistedProductIds,
}: ProductGridProps) {
  if (products.length === 0) {
    return empty ?? null;
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          hasSession={hasSession}
          initialInWishlist={wishlistedProductIds?.has(product.id) ?? false}
        />
      ))}
    </div>
  );
}
