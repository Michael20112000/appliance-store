import { describe, expect, it } from "vitest";
import {
  ALL_BRANDS_VALUE,
  brandSelectToUrlParam,
  catalogSortLabel,
  resolveBrandSelectValue,
} from "./catalog-labels";

describe("catalog-labels", () => {
  it("maps legacy all brand param to select value", () => {
    expect(resolveBrandSelectValue("all")).toBe(ALL_BRANDS_VALUE);
    expect(resolveBrandSelectValue(null)).toBe(ALL_BRANDS_VALUE);
    expect(brandSelectToUrlParam(ALL_BRANDS_VALUE)).toBeNull();
  });

  it("returns Ukrainian sort labels", () => {
    expect(catalogSortLabel("novi")).toBe("Найновіші");
    expect(catalogSortLabel("cina-asc")).toBe("Дешевше");
    expect(catalogSortLabel("cina-desc")).toBe("Дорожче");
  });
});
