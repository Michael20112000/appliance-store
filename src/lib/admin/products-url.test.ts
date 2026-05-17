import { describe, expect, it } from "vitest";
import { adminProductsUrl } from "./products-url";

describe("adminProductsUrl", () => {
  it("returns base path when all params are defaults", () => {
    expect(adminProductsUrl()).toBe("/admin/tovary");
    expect(adminProductsUrl({})).toBe("/admin/tovary");
  });

  it("includes status and categoryId filters", () => {
    expect(
      adminProductsUrl({
        status: "DRAFT",
        categoryId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
      }),
    ).toBe(
      "/admin/tovary?status=DRAFT&categoryId=clxxxxxxxxxxxxxxxxxxxxxxxxx",
    );
  });

  it("omits page when page is 1", () => {
    expect(
      adminProductsUrl({ status: "AVAILABLE", page: 1, pageSize: 50 }),
    ).toBe("/admin/tovary?status=AVAILABLE&pageSize=50");
  });

  it("includes page when greater than 1", () => {
    expect(adminProductsUrl({ page: 3, pageSize: 10 })).toBe(
      "/admin/tovary?page=3&pageSize=10",
    );
  });

  it("resets page in URL when filter changes with page 1", () => {
    expect(
      adminProductsUrl({
        status: "DRAFT",
        page: 1,
        pageSize: 20,
      }),
    ).toBe("/admin/tovary?status=DRAFT");
  });
});
