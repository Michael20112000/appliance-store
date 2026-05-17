import { describe, expect, it } from "vitest";
import { canAddProductToCart } from "./cart.service";

describe("canAddProductToCart", () => {
  it("allows AVAILABLE only", () => {
    expect(canAddProductToCart("AVAILABLE")).toBe(true);
    expect(canAddProductToCart("SOLD")).toBe(false);
    expect(canAddProductToCart("DRAFT")).toBe(false);
  });
});
