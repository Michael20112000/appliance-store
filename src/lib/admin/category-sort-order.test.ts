import { describe, expect, it } from "vitest";
import {
  insertCategoryAtRank,
  moveCategoryToRank,
  normalizeCategoryRanks,
} from "./category-sort-order";

describe("normalizeCategoryRanks", () => {
  it("assigns 1..n from legacy zero-based values", () => {
    const rows = [
      { id: "a", sortOrder: 0 },
      { id: "b", sortOrder: 0 },
      { id: "c", sortOrder: 1 },
    ];
    expect(normalizeCategoryRanks(rows).map((r) => r.sortOrder)).toEqual([1, 2, 3]);
  });
});

describe("moveCategoryToRank", () => {
  const base = [
    { id: "a", sortOrder: 1 },
    { id: "b", sortOrder: 2 },
    { id: "c", sortOrder: 3 },
  ];

  it("second → 3 shifts former third to 2", () => {
    const result = moveCategoryToRank(base, "b", 3);
    expect(result.map((r) => `${r.id}:${r.sortOrder}`)).toEqual([
      "a:1",
      "c:2",
      "b:3",
    ]);
  });

  it("third → 1 shifts others down", () => {
    const result = moveCategoryToRank(base, "c", 1);
    expect(result.map((r) => `${r.id}:${r.sortOrder}`)).toEqual([
      "c:1",
      "a:2",
      "b:3",
    ]);
  });

  it("clamps rank above n to n", () => {
    const result = moveCategoryToRank(base, "a", 62);
    expect(result.find((r) => r.id === "a")?.sortOrder).toBe(3);
  });
});

describe("insertCategoryAtRank", () => {
  it("clamps insert rank and renumbers", () => {
    const result = insertCategoryAtRank(
      [
        { id: "a", sortOrder: 1 },
        { id: "b", sortOrder: 2 },
      ],
      "new",
      1,
    );
    expect(result.map((r) => `${r.id}:${r.sortOrder}`)).toEqual([
      "new:1",
      "a:2",
      "b:3",
    ]);
  });
});
