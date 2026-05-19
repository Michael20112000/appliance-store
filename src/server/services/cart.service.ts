import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type { CartLineDto, CartViewDto } from "@/types/cart";
import { isProductPurchasable } from "./product-availability";

const PUBLIC_STATUS = "AVAILABLE" as const;

const cartLineInclude = {
  product: {
    include: {
      images: {
        orderBy: { sortOrder: "asc" as const },
        take: 1,
        select: { cloudinaryPublicId: true, alt: true },
      },
    },
  },
} satisfies Prisma.CartItemInclude;

type CartItemWithProduct = Prisma.CartItemGetPayload<{
  include: typeof cartLineInclude;
}>;

function mapLine(item: CartItemWithProduct): CartLineDto | null {
  if (!isProductPurchasable(item.product.status, item.product.quantity)) {
    return null;
  }

  const image = item.product.images[0];
  return {
    productId: item.productId,
    slug: item.product.slug,
    title: item.product.title,
    brand: item.product.brand,
    priceKopiyky: item.product.price,
    condition: item.product.condition,
    image: image
      ? { cloudinaryPublicId: image.cloudinaryPublicId, alt: image.alt }
      : null,
  };
}

export async function getOrCreateCart(userId: string) {
  const existing = await prisma.cart.findUnique({ where: { userId } });
  if (existing) return existing;

  try {
    return await prisma.cart.create({ data: { userId } });
  } catch (error) {
    const code =
      error &&
      typeof error === "object" &&
      "code" in error &&
      typeof error.code === "string"
        ? error.code
        : null;
    if (code === "P2002") {
      return prisma.cart.findUniqueOrThrow({ where: { userId } });
    }
    throw error;
  }
}

export async function getCartForUser(userId: string): Promise<CartViewDto> {
  const cart = await getOrCreateCart(userId);
  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: cartLineInclude,
  });

  const removedTitles: string[] = [];
  const staleIds: string[] = [];
  const lines: CartLineDto[] = [];

  for (const item of items) {
    const line = mapLine(item);
    if (line) {
      lines.push(line);
    } else {
      removedTitles.push(item.product.title);
      staleIds.push(item.id);
    }
  }

  if (staleIds.length > 0) {
    await prisma.cartItem.deleteMany({ where: { id: { in: staleIds } } });
  }

  const subtotalKopiyky = lines.reduce((sum, line) => sum + line.priceKopiyky, 0);

  return { items: lines, subtotalKopiyky, removedTitles };
}

export async function addToCart(userId: string, productId: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, status: PUBLIC_STATUS, quantity: { gte: 1 } },
    select: { id: true },
  });

  if (!product) {
    throw new Error("PRODUCT_UNAVAILABLE");
  }

  const cart = await getOrCreateCart(userId);

  await prisma.cartItem.upsert({
    where: {
      cartId_productId: { cartId: cart.id, productId },
    },
    create: { cartId: cart.id, productId, quantity: 1 },
    update: { quantity: 1 },
  });
}

export async function removeFromCart(userId: string, productId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, productId },
  });
}

export async function mergePendingItems(
  userId: string,
  pending: { productId: string }[],
) {
  const seen = new Set<string>();
  let merged = 0;

  for (const { productId } of pending) {
    if (seen.has(productId)) continue;
    seen.add(productId);

    try {
      await addToCart(userId, productId);
      merged += 1;
    } catch {
      // skip unavailable products
    }
  }

  return { merged };
}

export async function isProductInCart(
  userId: string,
  productId: string,
): Promise<boolean> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    select: {
      items: {
        where: { productId },
        select: { id: true },
        take: 1,
      },
    },
  });
  return (cart?.items.length ?? 0) > 0;
}

export async function getCartItemCount(userId: string): Promise<number> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    select: { _count: { select: { items: true } } },
  });
  return cart?._count.items ?? 0;
}

export async function clearCart(userId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
}

export function canAddProductToCart(status: string, quantity: number): boolean {
  return isProductPurchasable(status, quantity);
}

export async function resolveGuestCartProducts(
  productIds: string[],
): Promise<CartViewDto> {
  if (productIds.length === 0) {
    return { items: [], subtotalKopiyky: 0, removedTitles: [] };
  }

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: {
      images: {
        orderBy: { sortOrder: "asc" as const },
        take: 1,
        select: { cloudinaryPublicId: true, alt: true },
      },
    },
  });

  const byId = new Map(products.map((product) => [product.id, product]));
  const lines: CartLineDto[] = [];
  const removedTitles: string[] = [];

  for (const productId of productIds) {
    const product = byId.get(productId);
    if (!product) {
      continue;
    }
    if (!isProductPurchasable(product.status, product.quantity)) {
      removedTitles.push(product.title);
      continue;
    }
    const image = product.images[0];
    lines.push({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      brand: product.brand,
      priceKopiyky: product.price,
      condition: product.condition,
      image: image
        ? { cloudinaryPublicId: image.cloudinaryPublicId, alt: image.alt }
        : null,
    });
  }

  const subtotalKopiyky = lines.reduce((sum, line) => sum + line.priceKopiyky, 0);
  return { items: lines, subtotalKopiyky, removedTitles };
}
