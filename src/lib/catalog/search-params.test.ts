import { describe, expect, it } from "vitest";
import {
  catalogSearchParamsCache,
  parsersToFilters,
} from "./search-params";

describe("catalogSearchParamsCache.parse", () => {
  it("reads Ukrainian URL keys for price filters", async () => {
    const parsed = await catalogSearchParamsCache.parse({
      "cina-vid": "6400",
      "cina-do": "28900",
    });

    expect(parsed.cinaVid).toBe(6400);
    expect(parsed.cinaDo).toBe(28900);
  });

  it("reads storinka from Ukrainian URL key", async () => {
    const parsed = await catalogSearchParamsCache.parse({
      "сторінка": "2",
    });

    expect(parsed.storinka).toBe(2);
  });
});

describe("parsersToFilters", () => {
  it("maps cinaVid only to minPrice in kopiyky (13000 UAH → 1_300_000)", () => {
    const filters = parsersToFilters({
      q: "",
      brend: null,
      cinaVid: 13000,
      cinaDo: null,
      stan: [],
      sort: "novi",
      storinka: 1,
    });

    expect(filters.minPrice).toBe(1_300_000);
    expect(filters.maxPrice).toBeUndefined();
  });

  it("maps cinaDo only to maxPrice in kopiyky", () => {
    const filters = parsersToFilters({
      q: "",
      brend: null,
      cinaVid: null,
      cinaDo: 5000,
      stan: [],
      sort: "novi",
      storinka: 1,
    });

    expect(filters.minPrice).toBeUndefined();
    expect(filters.maxPrice).toBe(500_000);
  });

  it("converts both UAH price bounds to kopiyky", () => {
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
