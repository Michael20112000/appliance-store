import { describe, expect, it } from "vitest";
import { isProductPurchasable } from "./product-availability";

describe("isProductPurchasable", () => {
  it("allows AVAILABLE with quantity >= 1", () => {
    expect(isProductPurchasable("AVAILABLE", 1)).toBe(true);
    expect(isProductPurchasable("AVAILABLE", 5)).toBe(true);
  });

  it("rejects AVAILABLE with quantity 0", () => {
    expect(isProductPurchasable("AVAILABLE", 0)).toBe(false);
  });

  it("rejects non-AVAILABLE regardless of quantity", () => {
    expect(isProductPurchasable("SOLD", 5)).toBe(false);
    expect(isProductPurchasable("DRAFT", 1)).toBe(false);
  });
});
