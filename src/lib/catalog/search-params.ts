import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

export const catalogParsers = {
  q: parseAsString.withDefault(""),
  brend: parseAsString,
  cinaVid: parseAsInteger.withOptions({ clearOnDefault: true }),
  cinaDo: parseAsInteger.withOptions({ clearOnDefault: true }),
  stan: parseAsArrayOf(
    parseAsStringEnum(["LIKE_NEW", "GOOD", "FAIR"] as const),
  ).withDefault([]),
  sort: parseAsStringEnum(["novi", "cina-asc", "cina-desc"] as const).withDefault(
    "novi",
  ),
  storinka: parseAsInteger.withDefault(1),
};

export const catalogSearchParamsCache = createSearchParamsCache(catalogParsers);

export const catalogUrlKeys = {
  q: "q",
  brend: "brend",
  cinaVid: "cina-vid",
  cinaDo: "cina-do",
  stan: "stan",
  sort: "sort",
  storinka: "сторінка",
};

export function parsersToFilters(
  parsed: Awaited<ReturnType<typeof catalogSearchParamsCache.parse>>,
) {
  return {
    q: parsed.q || undefined,
    brand: parsed.brend ?? undefined,
    minPrice:
      parsed.cinaVid != null ? parsed.cinaVid * 100 : undefined,
    maxPrice:
      parsed.cinaDo != null ? parsed.cinaDo * 100 : undefined,
    conditions: parsed.stan.length ? parsed.stan : undefined,
  };
}
