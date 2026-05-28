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

  it("ignores q when length is less than 2 (single-char guard)", () => {
    const where = buildAdminProductWhere({ q: "S" });
    expect(where).not.toHaveProperty("OR");
  });

  it("adds OR clause for title/brand/description when q.length >= 2", () => {
    const where = buildAdminProductWhere({ q: "Samsung" });
    expect(where.OR).toHaveLength(3);
    expect(where.OR?.[0]).toEqual({ title: { contains: "Samsung", mode: "insensitive" } });
    expect(where.OR?.[1]).toEqual({ brand: { contains: "Samsung", mode: "insensitive" } });
    expect(where.OR?.[2]).toEqual({ description: { contains: "Samsung", mode: "insensitive" } });
  });

  it("ignores q when it is whitespace only (trim guard)", () => {
    const where = buildAdminProductWhere({ q: "  " });
    expect(where).not.toHaveProperty("OR");
  });
});
