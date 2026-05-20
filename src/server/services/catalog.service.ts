import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type {
  CatalogFilters,
  PaginatedProducts,
  PublicProductCard,
  PublicProductDetail,
} from "@/types/catalog";
import { catalogFiltersSchema, listProductsSchema } from "../validators/product";

const DEFAULT_PAGE_SIZE = 24;

const cardInclude = {
  category: { select: { id: true, name: true, slug: true } },
  images: {
    orderBy: { sortOrder: "asc" as const },
    take: 5,
    select: { cloudinaryPublicId: true, alt: true },
  },
} satisfies Prisma.ProductInclude;

export function buildCatalogContextWhere(
  categoryId?: string,
): Prisma.ProductWhereInput {
  return {
    quantity: { gte: 1 },
    ...(categoryId && { categoryId }),
  };
}

export function buildPublicProductWhere(
  input: CatalogFilters & { categoryId?: string },
): Prisma.ProductWhereInput {
  const filters = catalogFiltersSchema.parse(input);

  return {
    quantity: { gte: 1 },
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

export function mapToCard(
  product: Prisma.ProductGetPayload<{ include: typeof cardInclude }>,
): PublicProductCard {
  const previewImages = product.images.map((img) => ({
    cloudinaryPublicId: img.cloudinaryPublicId,
    alt: img.alt,
  }));
  const image = previewImages[0] ?? null;
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    brand: product.brand,
    price: product.price,
    condition: product.condition,
    category: product.category,
    previewImages,
    image,
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
    where: { slug, quantity: { gte: 1 } },
    include: {
      category: { select: { id: true, name: true, slug: true } },
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

  const previewImages = product.images.map((img) => ({
    cloudinaryPublicId: img.cloudinaryPublicId,
    alt: img.alt,
  }));
  const image = previewImages[0] ?? null;
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    brand: product.brand,
    price: product.price,
    condition: product.condition,
    category: product.category,
    description: product.description,
    previewImages,
    image,
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
      id: category.id,
      slug: category.slug,
      name: category.name,
      imagePublicId: category.imagePublicId,
      imageAlt: category.imageAlt,
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

export function similarPriceBandKopiyky(
  priceKop: number,
  band: 20 | 40,
): { minPrice: number; maxPrice: number } {
  if (band === 20) {
    return {
      minPrice: Math.floor(priceKop * 0.8),
      maxPrice: Math.ceil(priceKop * 1.2),
    };
  }
  return {
    minPrice: Math.floor(priceKop * 0.6),
    maxPrice: Math.ceil(priceKop * 1.4),
  };
}

type ProductWithCardInclude = Prisma.ProductGetPayload<{
  include: typeof cardInclude;
}>;

function fisherYatesShuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function mergeUniqueProducts(
  existing: ProductWithCardInclude[],
  incoming: ProductWithCardInclude[],
): ProductWithCardInclude[] {
  const seen = new Set(existing.map((p) => p.id));
  const merged = [...existing];
  for (const product of incoming) {
    if (!seen.has(product.id)) {
      seen.add(product.id);
      merged.push(product);
    }
  }
  return merged;
}

async function fetchSimilarProductPool(options: {
  categoryId: string;
  productId: string;
  minPrice?: number;
  maxPrice?: number;
  take?: number;
}): Promise<ProductWithCardInclude[]> {
  const where: Prisma.ProductWhereInput = {
    ...buildPublicProductWhere({
      categoryId: options.categoryId,
      ...(options.minPrice != null || options.maxPrice != null
        ? {
            minPrice: options.minPrice,
            maxPrice: options.maxPrice,
          }
        : {}),
    }),
    id: { not: options.productId },
  };

  return prisma.product.findMany({
    where,
    include: cardInclude,
    ...(options.take != null ? { take: options.take } : {}),
  });
}

export async function listSimilarPublicProducts(input: {
  productId: string;
  categoryId: string;
  price: number;
  limit?: number;
}): Promise<PublicProductCard[]> {
  const limit = input.limit ?? 4;
  const band20 = similarPriceBandKopiyky(input.price, 20);

  let pool = await fetchSimilarProductPool({
    categoryId: input.categoryId,
    productId: input.productId,
    minPrice: band20.minPrice,
    maxPrice: band20.maxPrice,
  });

  if (pool.length < limit) {
    const band40 = similarPriceBandKopiyky(input.price, 40);
    const pool40 = await fetchSimilarProductPool({
      categoryId: input.categoryId,
      productId: input.productId,
      minPrice: band40.minPrice,
      maxPrice: band40.maxPrice,
    });
    pool = mergeUniqueProducts(pool, pool40);
  }

  if (pool.length < limit) {
    const poolCategory = await fetchSimilarProductPool({
      categoryId: input.categoryId,
      productId: input.productId,
      take: 50,
    });
    pool = mergeUniqueProducts(pool, poolCategory);
  }

  if (pool.length === 0) {
    return [];
  }

  return fisherYatesShuffle(pool)
    .slice(0, limit)
    .map(mapToCard);
}

export async function listPublicProductSlugsForSitemap(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: { quantity: { gte: 1 } },
    select: { slug: true },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map((r) => r.slug);
}
