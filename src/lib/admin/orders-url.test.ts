import { describe, expect, it } from "vitest";
import { adminOrdersUrl } from "./orders-url";

describe("adminOrdersUrl", () => {
  it("returns base path when all params are defaults", () => {
    expect(adminOrdersUrl()).toBe("/admin/zamovlennia");
    expect(adminOrdersUrl({})).toBe("/admin/zamovlennia");
  });

  it("omits page when page is 1", () => {
    expect(
      adminOrdersUrl({ filter: "new", page: 1, pageSize: 50 }),
    ).toBe("/admin/zamovlennia?filter=new&pageSize=50");
  });

  it("includes non-default filter and pageSize", () => {
    expect(adminOrdersUrl({ filter: "new", pageSize: 50 })).toBe(
      "/admin/zamovlennia?filter=new&pageSize=50",
    );
  });

  it("includes page when greater than 1", () => {
    expect(adminOrdersUrl({ page: 3, sort: "orderNumber", dir: "asc" })).toBe(
      "/admin/zamovlennia?page=3&sort=orderNumber&dir=asc",
    );
  });

  it("supports filter change with page reset to 1", () => {
    expect(
      adminOrdersUrl({
        filter: "new",
        page: 1,
        pageSize: 20,
        sort: "createdAt",
        dir: "desc",
      }),
    ).toBe("/admin/zamovlennia?filter=new");
  });
});
