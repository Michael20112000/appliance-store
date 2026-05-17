import type { Prisma, ProductStatus } from "@/generated/prisma/client";
import { WISHLIST_MAX_ITEMS } from "@/lib/wishlist/constants";
import { prisma } from "@/lib/db";
import type { WishlistLineDto, WishlistViewDto } from "@/types/wishlist";

const PUBLIC_STATUS = "AVAILABLE" as const;

export const WISHLIST_MAX_ERROR = "WISHLIST_MAX";

const wishlistLineInclude = {
  product: {
    include: {
      images: {
        orderBy: { sortOrder: "asc" as const },
        take: 1,
        select: { cloudinaryPublicId: true, alt: true },
      },
    },
  },
} satisfies Prisma.WishlistItemInclude;

type WishlistItemWithProduct = Prisma.WishlistItemGetPayload<{
  include: typeof wishlistLineInclude;
}>;

type ProductWithImage = Prisma.ProductGetPayload<{
  include: {
    images: {
      orderBy: { sortOrder: "asc" };
      take: 1;
      select: { cloudinaryPublicId: true; alt: true };
    };
  };
}>;

export function isWishlistProductAvailable(status: ProductStatus | string): boolean {
  return status === PUBLIC_STATUS;
}

function mapWishlistItem(item: WishlistItemWithProduct): WishlistLineDto {
  const image = item.product.images[0];
  return {
    productId: item.productId,
    slug: item.product.slug,
    title: item.product.title,
    brand: item.product.brand,
    priceKopiyky: item.product.price,
    condition: item.product.condition,
    status: item.product.status,
    available: isWishlistProductAvailable(item.product.status),
    image: image
      ? { cloudinaryPublicId: image.cloudinaryPublicId, alt: image.alt }
      : null,
    addedAt: item.createdAt.toISOString(),
  };
}

function mapResolvedProduct(product: ProductWithImage): WishlistLineDto {
  const image = product.images[0];
  return {
    productId: product.id,
    slug: product.slug,
    title: product.title,
    brand: product.brand,
    priceKopiyky: product.price,
    condition: product.condition,
    status: product.status,
    available: isWishlistProductAvailable(product.status),
    image: image
      ? { cloudinaryPublicId: image.cloudinaryPublicId, alt: image.alt }
      : null,
    addedAt: product.createdAt.toISOString(),
  };
}

export async function listWishlistForUser(
  userId: string,
): Promise<WishlistViewDto> {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: wishlistLineInclude,
    orderBy: { createdAt: "desc" },
  });

  return { lines: items.map(mapWishlistItem) };
}

export async function listWishlistPreviewForUser(
  userId: string,
  limit = 3,
): Promise<WishlistLineDto[]> {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: wishlistLineInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return items.map(mapWishlistItem);
}

export async function addToWishlist(userId: string, productId: string) {
  const alreadyInWishlist = await isProductInWishlist(userId, productId);
  if (!alreadyInWishlist) {
    const count = await getWishlistItemCount(userId);
    if (count >= WISHLIST_MAX_ITEMS) {
      throw new Error(WISHLIST_MAX_ERROR);
    }
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, status: PUBLIC_STATUS },
    select: { id: true },
  });

  if (!product) {
    throw new Error("PRODUCT_UNAVAILABLE");
  }

  try {
    await prisma.wishlistItem.create({
      data: { userId, productId },
    });
  } catch (error) {
    const code =
      error &&
      typeof error === "object" &&
      "code" in error &&
      typeof error.code === "string"
        ? error.code
        : null;
    if (code !== "P2002") {
      throw error;
    }
  }
}

export async function removeFromWishlist(userId: string, productId: string) {
  await prisma.wishlistItem.deleteMany({
    where: { userId, productId },
  });
}

export async function clearWishlistForUser(userId: string) {
  await prisma.wishlistItem.deleteMany({ where: { userId } });
}

export async function getWishlistItemCount(userId: string): Promise<number> {
  return prisma.wishlistItem.count({ where: { userId } });
}

export async function getWishlistedProductIds(userId: string): Promise<string[]> {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    select: { productId: true },
  });
  return items.map((item) => item.productId);
}

export async function isProductInWishlist(
  userId: string,
  productId: string,
): Promise<boolean> {
  const row = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true },
  });
  return row != null;
}

export async function mergePendingWishlistItems(
  userId: string,
  pending: { productId: string }[],
) {
  const existingIds = new Set(await getWishlistedProductIds(userId));
  const seen = new Set<string>();
  let merged = 0;

  for (const { productId } of pending) {
    if (seen.has(productId) || existingIds.has(productId)) {
      seen.add(productId);
      continue;
    }
    seen.add(productId);

    if (existingIds.size >= WISHLIST_MAX_ITEMS) {
      break;
    }

    try {
      await addToWishlist(userId, productId);
      existingIds.add(productId);
      merged += 1;
    } catch {
      // skip unavailable products
    }
  }

  return { merged };
}

export async function resolveProductsByIds(
  productIds: string[],
): Promise<WishlistLineDto[]> {
  if (productIds.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { cloudinaryPublicId: true, alt: true },
      },
    },
  });

  const byId = new Map(products.map((product) => [product.id, product]));

  return productIds
    .map((id) => byId.get(id))
    .filter((product): product is ProductWithImage => product != null)
    .map(mapResolvedProduct);
}
