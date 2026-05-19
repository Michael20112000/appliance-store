import { describe, expect, it } from "vitest";
import { isProductPurchasable } from "./product-availability";

describe("isProductPurchasable", () => {
  it("returns true when quantity is at least 1", () => {
    expect(isProductPurchasable(1)).toBe(true);
    expect(isProductPurchasable(5)).toBe(true);
  });

  it("returns false when quantity is 0", () => {
    expect(isProductPurchasable(0)).toBe(false);
  });
});
