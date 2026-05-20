import type { ProductCondition } from "@/generated/prisma/client";

export type CatalogFilters = {
  q?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  conditions?: ProductCondition[];
};

export type PublicProductCardImage = {
  cloudinaryPublicId: string;
  alt: string | null;
};

export type PublicProductCard = {
  id: string;
  title: string;
  slug: string;
  brand: string;
  price: number;
  condition: ProductCondition;
  category: { id: string; name: string; slug: string };
  previewImages: PublicProductCardImage[];
  image: PublicProductCardImage | null;
};

export type PublicProductDetail = PublicProductCard & {
  description: string | null;
  images: Array<{
    cloudinaryPublicId: string;
    alt: string | null;
    sortOrder: number;
  }>;
};

export type PaginatedProducts<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
