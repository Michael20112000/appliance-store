import type { Product, WithContext } from "schema-dts";
import type { PublicProductDetail } from "@/types/catalog";
import { getEnv } from "@/lib/env";

function cloudinaryImageUrl(publicId: string): string {
  const cloudName = getEnv().NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
}

const CONDITION_MAP = {
  LIKE_NEW: "https://schema.org/RefurbishedCondition",
  GOOD: "https://schema.org/UsedCondition",
  FAIR: "https://schema.org/UsedCondition",
} as const;

export function buildProductJsonLd(
  product: PublicProductDetail,
  canonicalUrl: string,
): WithContext<Product> {
  const image = product.images[0];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    brand: { "@type": "Brand", name: product.brand },
    description: product.description ?? undefined,
    image: image ? cloudinaryImageUrl(image.cloudinaryPublicId) : undefined,
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "UAH",
      price: (product.price / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      itemCondition: CONDITION_MAP[product.condition],
    },
  };
}
