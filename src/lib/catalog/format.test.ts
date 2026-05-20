import { describe, expect, it } from "vitest";
import { formatCategoryCountBadge } from "./format";

describe("formatCategoryCountBadge", () => {
  it("returns singular label for count 1", () => {
    expect(formatCategoryCountBadge(1)).toBe("1 товар");
  });

  it("returns digits only for count >= 2", () => {
    expect(formatCategoryCountBadge(2)).toBe("2");
    expect(formatCategoryCountBadge(12)).toBe("12");
  });
});
