import { describe, expect, it } from "vitest";
import { kopiykyToRevenueUah } from "./analytics";

describe("kopiykyToRevenueUah", () => {
  it("converts kopiyky to whole UAH", () => {
    expect(kopiykyToRevenueUah(28_948_200)).toBe(289_482);
    expect(kopiykyToRevenueUah(120_00)).toBe(120);
  });
});
