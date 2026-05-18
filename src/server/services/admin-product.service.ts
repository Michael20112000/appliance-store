import type { Prisma, ProductStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { computeTotalPages } from "@/lib/pagination";
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

export type ProductStatusFilterKey = "" | ProductStatus;

export type ProductFilterCounts = {
  status: Record<ProductStatusFilterKey, number>;
  category: Record<string, number>;
};

const PRODUCT_STATUS_FILTER_KEYS: readonly ProductStatusFilterKey[] = [
  "",
  "DRAFT",
  "AVAILABLE",
  "SOLD",
];

export async function getProductFilterCounts(
  categoryIds: string[],
  activeCategoryId?: string,
  activeStatus?: ProductStatus,
): Promise<ProductFilterCounts> {
  const baseForStatus: Prisma.ProductWhereInput = activeCategoryId
    ? { categoryId: activeCategoryId }
    : {};

  const statusCountValues = await Promise.all(
    PRODUCT_STATUS_FILTER_KEYS.map((status) =>
      prisma.product.count({
        where: {
          ...baseForStatus,
          ...(status ? { status } : {}),
        },
      }),
    ),
  );

  const status = PRODUCT_STATUS_FILTER_KEYS.reduce(
    (acc, key, index) => {
      acc[key] = statusCountValues[index] ?? 0;
      return acc;
    },
    {} as Record<ProductStatusFilterKey, number>,
  );

  const baseForCategory: Prisma.ProductWhereInput = activeStatus
    ? { status: activeStatus }
    : {};

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

  return { status, category };
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
    case "status":
      return { status: dir };
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
      quantity: data.quantity,
    },
    include: adminDetailInclude,
  });
}

export const PRODUCT_STATUS_LOCKED = "PRODUCT_STATUS_LOCKED";

export async function updateProductStatus(
  productId: string,
  status: "DRAFT" | "AVAILABLE",
) {
  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) {
    throw new Error(PRODUCT_NOT_FOUND);
  }
  if (existing.status === "SOLD") {
    throw new Error(PRODUCT_STATUS_LOCKED);
  }

  return prisma.product.update({
    where: { id: productId },
    data: { status },
    select: {
      id: true,
      slug: true,
      status: true,
      category: { select: { slug: true } },
    },
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

  let status =
    existing.status === "SOLD" ? existing.status : data.status;

  if (
    existing.status !== "SOLD" &&
    data.quantity === 0 &&
    status === "AVAILABLE"
  ) {
    status = "SOLD";
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
      status,
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
