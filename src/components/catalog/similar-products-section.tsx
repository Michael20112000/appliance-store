import { ProductGrid } from "@/components/catalog/product-grid";
import type { PublicProductCard } from "@/types/catalog";

type SimilarProductsSectionProps = {
  products: PublicProductCard[];
  hasSession?: boolean;
  wishlistedProductIds?: Set<string>;
};

export function SimilarProductsSection({
  products,
  hasSession = false,
  wishlistedProductIds,
}: SimilarProductsSectionProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section
      className="mt-16 border-t border-border pt-12"
      aria-labelledby="similar-products-heading"
    >
      <h2 id="similar-products-heading" className="text-lg font-medium">
        Схожі товари
      </h2>
      <div className="mt-6">
        <ProductGrid
          products={products}
          hasSession={hasSession}
          wishlistedProductIds={wishlistedProductIds}
        />
      </div>
    </section>
  );
}
