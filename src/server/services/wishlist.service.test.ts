import { describe, expect, it } from "vitest";
import { isProductPurchasable } from "./product-availability";

describe("wishlist availability", () => {
  it("uses quantity for availability", () => {
    expect(isProductPurchasable(1)).toBe(true);
    expect(isProductPurchasable(0)).toBe(false);
  });
});
