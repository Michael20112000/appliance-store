import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/db";
import {
  buildCatalogContextWhere,
  buildPublicProductWhere,
  getCatalogPriceBounds,
  getDistinctBrands,
} from "./catalog.service";

vi.mock("@/lib/db", () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
      aggregate: vi.fn(),
    },
  },
}));

describe("buildPublicProductWhere", () => {
  it("always filters AVAILABLE status with stock", () => {
    const where = buildPublicProductWhere({});
    expect(where.status).toBe("AVAILABLE");
    expect(where.quantity).toEqual({ gte: 1 });
  });

  it("filters by categoryId", () => {
    const where = buildPublicProductWhere({ categoryId: "cat-1" });
    expect(where.categoryId).toBe("cat-1");
    expect(where.status).toBe("AVAILABLE");
  });

  it("applies brand and price filters", () => {
    const where = buildPublicProductWhere({
      brand: "Samsung",
      minPrice: 100_00,
      maxPrice: 500_00,
    });
    expect(where.brand).toBe("Samsung");
    expect(where.price).toEqual({ gte: 100_00, lte: 500_00 });
  });

  it("applies minPrice only (gte without lte)", () => {
    const where = buildPublicProductWhere({ minPrice: 1_300_000 });
    expect(where.price).toEqual({ gte: 1_300_000 });
    expect(where.price).not.toHaveProperty("lte");
  });

  it("applies text search when q length >= 2", () => {
    const where = buildPublicProductWhere({ q: "холод" });
    expect(where.OR).toHaveLength(2);
  });

  it("ignores single-character q", () => {
    const where = buildPublicProductWhere({ q: "a" });
    expect(where.OR).toBeUndefined();
  });

  it("applies condition filter", () => {
    const where = buildPublicProductWhere({ conditions: ["GOOD", "FAIR"] });
    expect(where.condition).toEqual({ in: ["GOOD", "FAIR"] });
  });
});

describe("buildCatalogContextWhere", () => {
  it("scopes to AVAILABLE in-stock products globally", () => {
    expect(buildCatalogContextWhere()).toEqual({
      status: "AVAILABLE",
      quantity: { gte: 1 },
    });
  });

  it("scopes to AVAILABLE in-stock products in a category", () => {
    expect(buildCatalogContextWhere("cat-phones")).toEqual({
      status: "AVAILABLE",
      quantity: { gte: 1 },
      categoryId: "cat-phones",
    });
  });
});

describe("getDistinctBrands", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queries all AVAILABLE brands without categoryId", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValueOnce([
      { brand: "Bosch" },
      { brand: "Samsung" },
    ] as never);

    const brands = await getDistinctBrands();

    expect(brands).toEqual(["Bosch", "Samsung"]);
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "AVAILABLE", quantity: { gte: 1 } },
        distinct: ["brand"],
      }),
    );
  });

  it("queries brands scoped to categoryId when provided", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValueOnce([
      { brand: "Apple" },
    ] as never);

    await getDistinctBrands("cat-phones");

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: "AVAILABLE",
          quantity: { gte: 1 },
          categoryId: "cat-phones",
        },
      }),
    );
  });
});

describe("getCatalogPriceBounds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns UAH bounds from kopiyky aggregate", async () => {
    vi.mocked(prisma.product.aggregate).mockResolvedValueOnce({
      _min: { price: 12_999 },
      _max: { price: 45_001 },
    } as never);

    const bounds = await getCatalogPriceBounds();

    expect(bounds).toEqual({ minUah: 129, maxUah: 451 });
    expect(prisma.product.aggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "AVAILABLE", quantity: { gte: 1 } },
      }),
    );
  });

  it("returns null when no products in context", async () => {
    vi.mocked(prisma.product.aggregate).mockResolvedValueOnce({
      _min: { price: null },
      _max: { price: null },
    } as never);

    expect(await getCatalogPriceBounds("cat-empty")).toBeNull();
  });
});
