import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type {
  CatalogFilters,
  PaginatedProducts,
  PublicProductCard,
  PublicProductDetail,
} from "@/types/catalog";
import { catalogFiltersSchema, listProductsSchema } from "../validators/product";

const PUBLIC_STATUS = "AVAILABLE" as const;
const DEFAULT_PAGE_SIZE = 24;

const cardInclude = {
  category: { select: { name: true, slug: true } },
  images: {
    orderBy: { sortOrder: "asc" as const },
    take: 1,
    select: { cloudinaryPublicId: true, alt: true },
  },
} satisfies Prisma.ProductInclude;

export function buildCatalogContextWhere(
  categoryId?: string,
): Prisma.ProductWhereInput {
  return {
    status: PUBLIC_STATUS,
    ...(categoryId && { categoryId }),
  };
}

export function buildPublicProductWhere(
  input: CatalogFilters & { categoryId?: string },
): Prisma.ProductWhereInput {
  const filters = catalogFiltersSchema.parse(input);

  return {
    status: PUBLIC_STATUS,
    ...(input.categoryId && { categoryId: input.categoryId }),
    ...(filters.brand && { brand: filters.brand }),
    ...(filters.conditions?.length && {
      condition: { in: filters.conditions },
    }),
    ...(filters.minPrice != null || filters.maxPrice != null
      ? {
          price: {
            ...(filters.minPrice != null && { gte: filters.minPrice }),
            ...(filters.maxPrice != null && { lte: filters.maxPrice }),
          },
        }
      : {}),
    ...(filters.q && filters.q.trim().length >= 2
      ? {
          OR: [
            { title: { contains: filters.q.trim(), mode: "insensitive" } },
            {
              description: {
                contains: filters.q.trim(),
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };
}

function mapToCard(
  product: Prisma.ProductGetPayload<{ include: typeof cardInclude }>,
): PublicProductCard {
  const image = product.images[0];
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    brand: product.brand,
    price: product.price,
    condition: product.condition,
    category: product.category,
    image: image
      ? { cloudinaryPublicId: image.cloudinaryPublicId, alt: image.alt }
      : null,
  };
}

type SortKey = "novi" | "cina-asc" | "cina-desc";

function orderByForSort(sort: SortKey = "novi"): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "cina-asc":
      return { price: "asc" };
    case "cina-desc":
      return { price: "desc" };
    default:
      return { createdAt: "desc" };
  }
}

export async function listPublicProducts(options: {
  categoryId?: string;
  filters?: CatalogFilters;
  page?: number;
  pageSize?: number;
  sort?: SortKey;
}): Promise<PaginatedProducts<PublicProductCard>> {
  const { page, pageSize } = listProductsSchema.parse({
    page: options.page ?? 1,
    pageSize: options.pageSize ?? DEFAULT_PAGE_SIZE,
  });

  const where = buildPublicProductWhere({
    ...options.filters,
    categoryId: options.categoryId,
  });

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: cardInclude,
      orderBy: orderByForSort(options.sort),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: items.map(mapToCard),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getPublicProductBySlug(
  slug: string,
): Promise<PublicProductDetail | null> {
  const product = await prisma.product.findFirst({
    where: { slug, status: PUBLIC_STATUS },
    include: {
      category: { select: { name: true, slug: true } },
      images: {
        orderBy: { sortOrder: "asc" },
        select: {
          cloudinaryPublicId: true,
          alt: true,
          sortOrder: true,
        },
      },
    },
  });

  if (!product) return null;

  const image = product.images[0];
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    brand: product.brand,
    price: product.price,
    condition: product.condition,
    category: product.category,
    description: product.description,
    image: image
      ? { cloudinaryPublicId: image.cloudinaryPublicId, alt: image.alt }
      : null,
    images: product.images.map((img) => ({
      cloudinaryPublicId: img.cloudinaryPublicId,
      alt: img.alt,
      sortOrder: img.sortOrder,
    })),
  };
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function listCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getCatalogCategoryCounts(): Promise<{
  total: number;
  byCategoryId: Record<string, number>;
}> {
  const [total, grouped] = await Promise.all([
    prisma.product.count({ where: buildCatalogContextWhere() }),
    prisma.product.groupBy({
      by: ["categoryId"],
      where: buildCatalogContextWhere(),
      _count: { _all: true },
    }),
  ]);

  const byCategoryId = Object.fromEntries(
    grouped.map((row) => [row.categoryId, row._count._all]),
  );

  return { total, byCategoryId };
}

export async function listCategoriesWithProductCounts() {
  const [categories, counts] = await Promise.all([
    listCategories(),
    getCatalogCategoryCounts(),
  ]);

  return {
    totalProductCount: counts.total,
    categories: categories.map((category) => ({
      slug: category.slug,
      name: category.name,
      productCount: counts.byCategoryId[category.id] ?? 0,
    })),
  };
}

export async function getDistinctBrands(
  categoryId?: string,
): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: buildCatalogContextWhere(categoryId),
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  });
  return rows.map((r) => r.brand);
}

export async function getCatalogPriceBounds(
  categoryId?: string,
): Promise<{ minUah: number; maxUah: number } | null> {
  const agg = await prisma.product.aggregate({
    where: buildCatalogContextWhere(categoryId),
    _min: { price: true },
    _max: { price: true },
  });

  const minKop = agg._min.price;
  const maxKop = agg._max.price;
  if (minKop == null || maxKop == null) return null;

  return {
    minUah: Math.floor(minKop / 100),
    maxUah: Math.ceil(maxKop / 100),
  };
}

export async function listPublicProductSlugsForSitemap(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: { status: PUBLIC_STATUS },
    select: { slug: true },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map((r) => r.slug);
}
