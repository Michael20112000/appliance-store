import { describe, expect, it } from "vitest";
import { buildAdminProductWhere } from "./admin-product.service";

describe("buildAdminProductWhere", () => {
  it("returns empty object when no filters", () => {
    expect(buildAdminProductWhere({})).toEqual({});
  });

  it("filters by in_stock", () => {
    const where = buildAdminProductWhere({ stock: "in_stock" });
    expect(where.quantity).toEqual({ gte: 1 });
  });

  it("filters by out_of_stock", () => {
    const where = buildAdminProductWhere({ stock: "out_of_stock" });
    expect(where.quantity).toBe(0);
  });

  it("filters by categoryId", () => {
    const where = buildAdminProductWhere({ categoryId: "cat-1" });
    expect(where.categoryId).toBe("cat-1");
  });
});
