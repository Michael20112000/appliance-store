import { describe, expect, it } from "vitest";
import { updateOrderStatusSchema } from "./admin-order";

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
