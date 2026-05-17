import type { ProductCondition } from "@/generated/prisma/client";

export type CartLineDto = {
  productId: string;
  slug: string;
  title: string;
  brand: string;
  priceKopiyky: number;
  condition: ProductCondition;
  image: {
    cloudinaryPublicId: string;
    alt: string | null;
  } | null;
};

export type CartViewDto = {
  items: CartLineDto[];
  subtotalKopiyky: number;
  removedTitles: string[];
};
