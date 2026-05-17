import { describe, expect, it } from "vitest";
import {
  appendSlugSuffix,
  assertCategoryDeletable,
  CATEGORY_HAS_PRODUCTS,
  slugFromName,
} from "./admin-catalog.service";

describe("slugFromName", () => {
  it("transliterates Ukrainian name to latin slug", () => {
    expect(slugFromName("Холодильники")).toBe("kholodylnyky");
  });
});

describe("appendSlugSuffix", () => {
  it("returns base slug for suffix 1", () => {
    expect(appendSlugSuffix("kholodylnyky", 1)).toBe("kholodylnyky");
  });

  it("appends numeric suffix for collisions", () => {
    expect(appendSlugSuffix("kholodylnyky", 2)).toBe("kholodylnyky-2");
  });
});

describe("assertCategoryDeletable", () => {
  it("throws CATEGORY_HAS_PRODUCTS when product count > 0", () => {
    expect(() => assertCategoryDeletable(1)).toThrow(CATEGORY_HAS_PRODUCTS);
  });

  it("allows delete when no products", () => {
    expect(() => assertCategoryDeletable(0)).not.toThrow();
  });
});
