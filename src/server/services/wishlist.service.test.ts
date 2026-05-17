import { describe, expect, it } from "vitest";
import { isWishlistProductAvailable } from "./wishlist.service";

describe("isWishlistProductAvailable", () => {
  it("marks only AVAILABLE products as available", () => {
    expect(isWishlistProductAvailable("AVAILABLE")).toBe(true);
    expect(isWishlistProductAvailable("SOLD")).toBe(false);
    expect(isWishlistProductAvailable("DRAFT")).toBe(false);
  });
});
