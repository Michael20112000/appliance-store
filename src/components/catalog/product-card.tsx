import Link from "next/link";
import { ConditionBadge } from "@/components/catalog/condition-badge";
import { PriceDisplay } from "@/components/catalog/price-display";
import { OptimizedImage } from "@/components/media/optimized-image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPriceKopiyky } from "@/lib/catalog/format";
import type { PublicProductCard } from "@/types/catalog";

type ProductCardProps = {
  product: PublicProductCard;
};

export function ProductCard({ product }: ProductCardProps) {
  const imageAlt =
    product.image?.alt ??
    `${product.title} — ${product.brand}, б/у, Львів`;

  return (
    <Link
      href={`/tovar/${product.slug}`}
      className="group block h-full"
      aria-label={`${product.title}, ${formatPriceKopiyky(product.price)}`}
    >
      <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-md">
        <div className="relative aspect-[4/3] w-full bg-muted">
          {product.image ? (
            <OptimizedImage
              src={product.image.cloudinaryPublicId}
              alt={imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Без фото
            </div>
          )}
          <ConditionBadge
            condition={product.condition}
            className="absolute left-2 top-2"
          />
        </div>
        <CardHeader className="space-y-1 p-4">
          <CardTitle className="line-clamp-2 text-base font-medium leading-snug">
            {product.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{product.brand}</p>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <PriceDisplay priceKopiyky={product.price} className="text-lg" />
        </CardContent>
      </Card>
    </Link>
  );
}
