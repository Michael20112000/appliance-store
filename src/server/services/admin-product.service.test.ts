import { describe, expect, it } from "vitest";
import {
  assertProductDeletable,
  buildAdminProductWhere,
  normalizeProductImages,
  priceUahToKopiyky,
  PRODUCT_IN_ACTIVE_ORDER,
  PRODUCT_IN_CART,
} from "./admin-product.service";

describe("priceUahToKopiyky", () => {
  it("converts UAH to kopiyky", () => {
    expect(priceUahToKopiyky(4500)).toBe(450_000);
  });
});

describe("buildAdminProductWhere", () => {
  it("does not force AVAILABLE status", () => {
    const where = buildAdminProductWhere({});
    expect(where.status).toBeUndefined();
  });

  it("includes status filter when provided", () => {
    const where = buildAdminProductWhere({ status: "DRAFT" });
    expect(where.status).toBe("DRAFT");
  });

  it("filters by categoryId and search query", () => {
    const where = buildAdminProductWhere({
      categoryId: "cat-1",
      q: "samsung",
    });
    expect(where.categoryId).toBe("cat-1");
    expect(where.OR).toHaveLength(3);
  });
});

describe("assertProductDeletable", () => {
  it("throws PRODUCT_IN_CART when cart items exist", () => {
    expect(() => assertProductDeletable(1, 0)).toThrow(PRODUCT_IN_CART);
  });

  it("throws PRODUCT_IN_ACTIVE_ORDER when active orders exist", () => {
    expect(() => assertProductDeletable(0, 1)).toThrow(PRODUCT_IN_ACTIVE_ORDER);
  });

  it("allows delete when no cart or active orders", () => {
    expect(() => assertProductDeletable(0, 0)).not.toThrow();
  });
});

describe("normalizeProductImages", () => {
  it("assigns sortOrder 0..n-1 and caps at 8 images", () => {
    const images = Array.from({ length: 10 }, (_, i) => ({
      cloudinaryPublicId: `img-${i}`,
      sortOrder: i,
    }));
    const normalized = normalizeProductImages(images);
    expect(normalized).toHaveLength(8);
    expect(normalized[0]?.sortOrder).toBe(0);
    expect(normalized[7]?.sortOrder).toBe(7);
  });
});
