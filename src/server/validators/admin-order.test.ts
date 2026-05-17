import { describe, expect, it } from "vitest";
import { listOrdersAdminSchema, updateOrderStatusSchema } from "./admin-order";

describe("updateOrderStatusSchema", () => {
  it("accepts valid order status update", () => {
    const result = updateOrderStatusSchema.safeParse({
      orderId: "clh3abc1234567890123456789",
      status: "CONFIRMED",
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown status enum", () => {
    const result = updateOrderStatusSchema.safeParse({
      orderId: "clh3abc1234567890123456789",
      status: "SHIPPED",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid order id", () => {
    const result = updateOrderStatusSchema.safeParse({
      orderId: "not-a-cuid",
      status: "PENDING",
    });
    expect(result.success).toBe(false);
  });
});

describe("listOrdersAdminSchema", () => {
  it("defaults empty input to filter all, page 1, pageSize 20, sort createdAt, dir desc", () => {
    const result = listOrdersAdminSchema.parse({});
    expect(result).toEqual({
      filter: "all",
      page: 1,
      pageSize: 20,
      sort: "createdAt",
      dir: "desc",
    });
  });

  it("parses explicit list params", () => {
    const result = listOrdersAdminSchema.parse({
      filter: "new",
      page: "2",
      pageSize: "50",
      sort: "orderNumber",
      dir: "asc",
    });
    expect(result).toEqual({
      filter: "new",
      page: 2,
      pageSize: 50,
      sort: "orderNumber",
      dir: "asc",
    });
  });

  it("rejects invalid pageSize", () => {
    const result = listOrdersAdminSchema.safeParse({ pageSize: 99 });
    expect(result.success).toBe(false);
  });
});
