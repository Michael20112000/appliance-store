import { describe, expect, it } from "vitest";
import { adminProductsUrl } from "./products-url";

describe("adminProductsUrl", () => {
  it("returns base path when all params are defaults", () => {
    expect(adminProductsUrl()).toBe("/admin/tovary");
    expect(adminProductsUrl({})).toBe("/admin/tovary");
  });

  it("includes stock and categoryId filters", () => {
    expect(
      adminProductsUrl({
        stock: "out_of_stock",
        categoryId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
      }),
    ).toBe(
      "/admin/tovary?stock=out_of_stock&categoryId=clxxxxxxxxxxxxxxxxxxxxxxxxx",
    );
  });

  it("omits page when page is 1", () => {
    expect(
      adminProductsUrl({ stock: "in_stock", page: 1, pageSize: 50 }),
    ).toBe("/admin/tovary?stock=in_stock&pageSize=50");
  });

  it("includes page when greater than 1", () => {
    expect(adminProductsUrl({ page: 3, pageSize: 10 })).toBe(
      "/admin/tovary?page=3&pageSize=10",
    );
  });

  it("resets page in URL when filter changes with page 1", () => {
    expect(
      adminProductsUrl({
        stock: "in_stock",
        page: 1,
        pageSize: 20,
      }),
    ).toBe("/admin/tovary?stock=in_stock");
  });

  it("includes sort and dir when sort is active", () => {
    expect(adminProductsUrl({ sort: "title", dir: "asc" })).toBe(
      "/admin/tovary?sort=title&dir=asc",
    );
  });

  it("omits dir when sort is set with default desc", () => {
    expect(adminProductsUrl({ sort: "price", dir: "desc" })).toBe(
      "/admin/tovary?sort=price",
    );
  });

  it("preserves sort on pagination and filters", () => {
    expect(
      adminProductsUrl({
        page: 3,
        sort: "price",
        dir: "desc",
        stock: "in_stock",
      }),
    ).toBe("/admin/tovary?stock=in_stock&page=3&sort=price");
  });
});
