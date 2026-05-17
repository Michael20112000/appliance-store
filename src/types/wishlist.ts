import type { ProductCondition, ProductStatus } from "@/generated/prisma/client";

export type WishlistLineDto = {
  productId: string;
  slug: string;
  title: string;
  brand: string;
  priceKopiyky: number;
  condition: ProductCondition;
  status: ProductStatus;
  available: boolean;
  image: {
    cloudinaryPublicId: string;
    alt: string | null;
  } | null;
  addedAt: string;
};

export type WishlistViewDto = {
  lines: WishlistLineDto[];
};

export type WishlistActionResult =
  | { ok: true }
  | { ok: false; error: "PRODUCT_UNAVAILABLE" | "WISHLIST_MAX" | "UNKNOWN" };
