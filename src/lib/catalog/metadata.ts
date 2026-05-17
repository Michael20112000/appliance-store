import type { Metadata } from "next";
import type { PublicProductDetail } from "@/types/catalog";
import { getEnv } from "@/lib/env";

type CategoryForMeta = { name: string; slug: string };

export function hasActiveCatalogFilters(parsed: {
  q: string;
  brend: string | null;
  cinaVid: number | null;
  cinaDo: number | null;
  stan: string[];
}): boolean {
  return Boolean(
    parsed.brend ||
      parsed.cinaVid != null ||
      parsed.cinaDo != null ||
      parsed.stan.length > 0 ||
      (parsed.q && parsed.q.trim().length > 0),
  );
}

export function catalogListingMetadata(options: {
  hasActiveFilters: boolean;
}): Metadata {
  const metadata: Metadata = {
    title: "Каталог б/у техніки у Львові",
    description:
      "Каталог перевіреної б/у побутової техніки у Львові — пральні машини, холодильники, телевізори та інше.",
  };

  if (options.hasActiveFilters) {
    metadata.robots = { index: false, follow: true };
  }

  return metadata;
}

export function categoryMetadata(category: CategoryForMeta): Metadata {
  return {
    title: `${category.name} у Львові — б/у техніка`,
    description: `Б/у ${category.name.toLowerCase()} у Львові — перевірений стан, чесна ціна, самовивіз або доставка.`,
  };
}

function cloudinaryImageUrl(publicId: string): string {
  const cloudName = getEnv().NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
}

export function productMetadata(product: PublicProductDetail): Metadata {
  const description =
    product.description?.slice(0, 155) ??
    `${product.title} — ${product.brand}. Б/у техніка у Львові.`;

  const firstImage = product.images[0];

  return {
    title: `${product.title} — ${product.brand}`,
    description,
    openGraph: firstImage
      ? {
          images: [
            {
              url: cloudinaryImageUrl(firstImage.cloudinaryPublicId),
              alt: firstImage.alt ?? product.title,
            },
          ],
        }
      : undefined,
  };
}
