import { describe, expect, it } from "vitest";
import { canAddProductToCart } from "./cart.service";

describe("canAddProductToCart", () => {
  it("allows AVAILABLE with stock", () => {
    expect(canAddProductToCart("AVAILABLE", 1)).toBe(true);
    expect(canAddProductToCart("AVAILABLE", 3)).toBe(true);
  });

  it("rejects AVAILABLE with zero quantity", () => {
    expect(canAddProductToCart("AVAILABLE", 0)).toBe(false);
  });

  it("rejects non-AVAILABLE status", () => {
    expect(canAddProductToCart("SOLD", 5)).toBe(false);
    expect(canAddProductToCart("DRAFT", 1)).toBe(false);
  });
});
