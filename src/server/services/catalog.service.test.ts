import { describe, expect, it } from "vitest";
import { buildPublicProductWhere } from "./catalog.service";

describe("buildPublicProductWhere", () => {
  it("always filters AVAILABLE status", () => {
    const where = buildPublicProductWhere({});
    expect(where.status).toBe("AVAILABLE");
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
