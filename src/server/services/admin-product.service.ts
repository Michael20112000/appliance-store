import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type {
  ListAdminProductsFilters,
  ProductImageInput,
  UpdateProductValues,
  UpsertProductValues,
} from "@/server/validators/admin-product";
import {
  appendSlugSuffix,
  slugFromName,
} from "@/server/services/admin-catalog.service";

export const PRODUCT_IN_CART = "PRODUCT_IN_CART";
export const PRODUCT_IN_ACTIVE_ORDER = "PRODUCT_IN_ACTIVE_ORDER";
export const PRODUCT_NOT_FOUND = "PRODUCT_NOT_FOUND";

const TERMINAL_ORDER_STATUSES = ["CANCELLED", "COMPLETED"] as const;
const MAX_PRODUCT_IMAGES = 8;

const adminListInclude = {
  category: { select: { name: true, slug: true } },
  images: {
    orderBy: { sortOrder: "asc" as const },
    take: 1,
    select: { cloudinaryPublicId: true, alt: true },
  },
} satisfies Prisma.ProductInclude;

const adminDetailInclude = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { sortOrder: "asc" as const } },
} satisfies Prisma.ProductInclude;

export function priceUahToKopiyky(uah: number): number {
  return Math.round(uah * 100);
}

export function buildAdminProductWhere(
  filters: Pick<ListAdminProductsFilters, "status" | "categoryId" | "q">,
): Prisma.ProductWhereInput {
  const q = filters.q?.trim();

  return {
    ...(filters.status && { status: filters.status }),
    ...(filters.categoryId && { categoryId: filters.categoryId }),
    ...(q && q.length >= 2
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { brand: { contains: q, mode: "insensitive" } },
            {
              description: {
                contains: q,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };
}

export function assertProductDeletable(
  cartItemCount: number,
  activeOrderCount: number,
): void {
  if (cartItemCount > 0) {
    throw new Error(PRODUCT_IN_CART);
  }
  if (activeOrderCount > 0) {
    throw new Error(PRODUCT_IN_ACTIVE_ORDER);
  }
}

export function normalizeProductImages(
  images: Pick<ProductImageInput, "cloudinaryPublicId" | "alt" | "width" | "height">[],
): Array<{
  cloudinaryPublicId: string;
  alt: string | null;
  sortOrder: number;
  width: number | null;
  height: number | null;
}> {
  return images.slice(0, MAX_PRODUCT_IMAGES).map((image, index) => ({
    cloudinaryPublicId: image.cloudinaryPublicId,
    alt: image.alt?.trim() ? image.alt.trim() : null,
    sortOrder: index,
    width: image.width ?? null,
    height: image.height ?? null,
  }));
}

async function resolveUniqueProductSlug(
  baseSlug: string,
  excludeId?: string,
): Promise<string> {
  let suffix = 1;
  let candidate = baseSlug;

  while (true) {
    const existing = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) {
      return candidate;
    }
    suffix += 1;
    candidate = appendSlugSuffix(baseSlug, suffix);
  }
}

export async function listAdminProducts(filters: ListAdminProductsFilters) {
  const where = buildAdminProductWhere(filters);
  const skip = (filters.page - 1) * filters.pageSize;

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: adminListInclude,
      orderBy: { updatedAt: "desc" },
      skip,
      take: filters.pageSize,
    }),
  ]);

  return { items, total, page: filters.page, pageSize: filters.pageSize };
}

export async function getProductAdmin(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: adminDetailInclude,
  });
}

export async function createProduct(data: UpsertProductValues) {
  const baseSlug = data.slug?.trim() || slugFromName(data.title);
  const slug = await resolveUniqueProductSlug(baseSlug);

  return prisma.product.create({
    data: {
      title: data.title,
      slug,
      description: data.description ?? null,
      brand: data.brand,
      categoryId: data.categoryId,
      condition: data.condition,
      status: data.status ?? "DRAFT",
      price: priceUahToKopiyky(data.priceUah),
    },
    include: adminDetailInclude,
  });
}

export async function updateProduct(data: UpdateProductValues) {
  const existing = await prisma.product.findUnique({ where: { id: data.id } });
  if (!existing) {
    throw new Error(PRODUCT_NOT_FOUND);
  }

  let slug = existing.slug;
  if (data.slug?.trim()) {
    slug = await resolveUniqueProductSlug(data.slug.trim(), data.id);
  }

  const status =
    existing.status === "SOLD" ? existing.status : data.status;

  return prisma.product.update({
    where: { id: data.id },
    data: {
      title: data.title,
      slug,
      description: data.description ?? null,
      brand: data.brand,
      categoryId: data.categoryId,
      condition: data.condition,
      status,
      price: priceUahToKopiyky(data.priceUah),
    },
    include: adminDetailInclude,
  });
}

export async function syncProductImages(
  productId: string,
  images: ProductImageInput[],
) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) {
    throw new Error(PRODUCT_NOT_FOUND);
  }

  const normalized = normalizeProductImages(images);

  await prisma.$transaction([
    prisma.productImage.deleteMany({ where: { productId } }),
    ...(normalized.length > 0
      ? [
          prisma.productImage.createMany({
            data: normalized.map((image) => ({
              productId,
              cloudinaryPublicId: image.cloudinaryPublicId,
              alt: image.alt,
              sortOrder: image.sortOrder,
              width: image.width,
              height: image.height,
            })),
          }),
        ]
      : []),
  ]);

  return prisma.product.findUnique({
    where: { id: productId },
    include: adminDetailInclude,
  });
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new Error(PRODUCT_NOT_FOUND);
  }

  const [cartItemCount, activeOrderCount] = await Promise.all([
    prisma.cartItem.count({ where: { productId: id } }),
    prisma.orderItem.count({
      where: {
        productId: id,
        order: {
          status: { notIn: [...TERMINAL_ORDER_STATUSES] },
        },
      },
    }),
  ]);

  assertProductDeletable(cartItemCount, activeOrderCount);

  await prisma.product.delete({ where: { id } });
}
