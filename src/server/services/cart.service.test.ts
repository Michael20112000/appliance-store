import { describe, expect, it } from "vitest";
import { canAddProductToCart } from "./cart.service";

describe("canAddProductToCart", () => {
  it("allows when quantity is at least 1", () => {
    expect(canAddProductToCart(1)).toBe(true);
    expect(canAddProductToCart(3)).toBe(true);
  });

  it("rejects when quantity is 0", () => {
    expect(canAddProductToCart(0)).toBe(false);
  });
});
