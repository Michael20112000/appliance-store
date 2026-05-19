import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { computeTotalPages } from "@/lib/pagination";
import { ORDER_STATUS_LABELS_UA } from "@/lib/order/status-labels";
import type {
  AdminProductListDir,
  AdminProductListSort,
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

export type ProductStockFilterKey = "" | "in_stock" | "out_of_stock";

export function buildAdminProductWhere(
  filters: Pick<ListAdminProductsFilters, "stock" | "categoryId" | "q">,
): Prisma.ProductWhereInput {
  const q = filters.q?.trim();

  return {
    ...(filters.stock === "in_stock" && { quantity: { gte: 1 } }),
    ...(filters.stock === "out_of_stock" && { quantity: 0 }),
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
  defaultAlt?: string,
): Array<{
  cloudinaryPublicId: string;
  alt: string | null;
  sortOrder: number;
  width: number | null;
  height: number | null;
}> {
  return images.slice(0, MAX_PRODUCT_IMAGES).map((image, index) => ({
    cloudinaryPublicId: image.cloudinaryPublicId,
    alt: image.alt?.trim() || defaultAlt?.trim() || null,
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

export type ProductFilterCounts = {
  stock: Record<ProductStockFilterKey, number>;
  category: Record<string, number>;
};

const PRODUCT_STOCK_FILTER_KEYS: readonly ProductStockFilterKey[] = [
  "",
  "in_stock",
  "out_of_stock",
];

export async function getProductFilterCounts(
  categoryIds: string[],
  activeCategoryId?: string,
  activeStock?: ProductStockFilterKey,
): Promise<ProductFilterCounts> {
  const baseForStock: Prisma.ProductWhereInput = activeCategoryId
    ? { categoryId: activeCategoryId }
    : {};

  const stockCountValues = await Promise.all(
    PRODUCT_STOCK_FILTER_KEYS.map((stock) =>
      prisma.product.count({
        where: {
          ...baseForStock,
          ...(stock === "in_stock" && { quantity: { gte: 1 } }),
          ...(stock === "out_of_stock" && { quantity: 0 }),
        },
      }),
    ),
  );

  const stock = PRODUCT_STOCK_FILTER_KEYS.reduce(
    (acc, key, index) => {
      acc[key] = stockCountValues[index] ?? 0;
      return acc;
    },
    {} as Record<ProductStockFilterKey, number>,
  );

  const baseForCategory: Prisma.ProductWhereInput = {
    ...(activeStock === "in_stock" && { quantity: { gte: 1 } }),
    ...(activeStock === "out_of_stock" && { quantity: 0 }),
  };

  const [allCategoryCount, ...perCategoryCounts] = await Promise.all([
    prisma.product.count({ where: baseForCategory }),
    ...categoryIds.map((categoryId) =>
      prisma.product.count({
        where: { ...baseForCategory, categoryId },
      }),
    ),
  ]);

  const category: Record<string, number> = { all: allCategoryCount };
  categoryIds.forEach((categoryId, index) => {
    category[categoryId] = perCategoryCounts[index] ?? 0;
  });

  return { stock, category };
}

export function buildPrismaProductOrderBy(
  sort: AdminProductListSort | undefined,
  dir: AdminProductListDir,
): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "title":
      return { title: dir };
    case "category":
      return { category: { name: dir } };
    case "price":
      return { price: dir };
    case "quantity":
      return { quantity: dir };
    default:
      return { updatedAt: "desc" };
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
      orderBy: buildPrismaProductOrderBy(filters.sort, filters.dir),
      skip,
      take: filters.pageSize,
    }),
  ]);

  const totalPages = computeTotalPages(total, filters.pageSize);

  return {
    items,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages,
  };
}

export async function getProductAdmin(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: adminDetailInclude,
  });
}

export type ProductOrderListItem = {
  orderId: string;
  orderNumber: string;
  status: keyof typeof ORDER_STATUS_LABELS_UA;
  customerName: string;
  quantity: number;
  createdAt: Date;
};

export async function listOrdersForProductAdmin(
  productId: string,
): Promise<ProductOrderListItem[]> {
  const items = await prisma.orderItem.findMany({
    where: { productId },
    orderBy: { order: { createdAt: "desc" } },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          customerName: true,
          createdAt: true,
        },
      },
    },
  });

  return items.map((item) => ({
    orderId: item.order.id,
    orderNumber: item.order.orderNumber,
    status: item.order.status,
    customerName: item.order.customerName,
    quantity: item.quantity,
    createdAt: item.order.createdAt,
  }));
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
      price: priceUahToKopiyky(data.priceUah),
      quantity: data.quantity,
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

  return prisma.product.update({
    where: { id: data.id },
    data: {
      title: data.title,
      slug,
      description: data.description ?? null,
      brand: data.brand,
      categoryId: data.categoryId,
      condition: data.condition,
      price: priceUahToKopiyky(data.priceUah),
      quantity: data.quantity,
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
    select: { id: true, title: true },
  });
  if (!product) {
    throw new Error(PRODUCT_NOT_FOUND);
  }

  const normalized = normalizeProductImages(images, product.title);

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
