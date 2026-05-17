import { describe, expect, it } from "vitest";
import { parsersToFilters } from "./search-params";

describe("parsersToFilters", () => {
  it("converts UAH price bounds to kopiyky", () => {
    const filters = parsersToFilters({
      q: "",
      brend: null,
      cinaVid: 1000,
      cinaDo: 5000,
      stan: [],
      sort: "novi",
      storinka: 1,
    });

    expect(filters.minPrice).toBe(100_000);
    expect(filters.maxPrice).toBe(500_000);
  });

  it("omits empty q", () => {
    const filters = parsersToFilters({
      q: "",
      brend: "Bosch",
      cinaVid: null,
      cinaDo: null,
      stan: ["GOOD"],
      sort: "cina-asc",
      storinka: 2,
    });

    expect(filters.q).toBeUndefined();
    expect(filters.brand).toBe("Bosch");
    expect(filters.conditions).toEqual(["GOOD"]);
  });
});
