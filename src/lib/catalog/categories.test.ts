import { describe, expect, it } from "vitest";
import { categoriesWithAvailableProducts } from "./categories";

describe("categoriesWithAvailableProducts", () => {
  it("keeps categories with productCount > 0", () => {
    const input = [
      { slug: "a", productCount: 2 },
      { slug: "b", productCount: 0 },
      { slug: "c", productCount: 1 },
    ];
    expect(categoriesWithAvailableProducts(input)).toEqual([
      { slug: "a", productCount: 2 },
      { slug: "c", productCount: 1 },
    ]);
  });

  it("preserves input order after filtering", () => {
    const input = [
      { slug: "first", productCount: 1 },
      { slug: "empty", productCount: 0 },
      { slug: "last", productCount: 3 },
    ];
    expect(categoriesWithAvailableProducts(input).map((c) => c.slug)).toEqual([
      "first",
      "last",
    ]);
  });
});
