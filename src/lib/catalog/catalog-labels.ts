export const ALL_BRANDS_VALUE = "__all__";

const LEGACY_ALL_BRAND_VALUES = new Set(["all", "__all__", ""]);

export const CATALOG_SORT_LABELS = {
  novi: "Найновіші",
  "cina-asc": "Дешевше",
  "cina-desc": "Дорожче",
} as const;

export type CatalogSortValue = keyof typeof CATALOG_SORT_LABELS;

export function resolveBrandSelectValue(brend: string | null): string {
  if (brend == null || LEGACY_ALL_BRAND_VALUES.has(brend)) {
    return ALL_BRANDS_VALUE;
  }
  return brend;
}

export function brandSelectToUrlParam(value: string): string | null {
  if (value === ALL_BRANDS_VALUE || LEGACY_ALL_BRAND_VALUES.has(value)) {
    return null;
  }
  return value;
}

export function catalogSortLabel(sort: CatalogSortValue): string {
  return CATALOG_SORT_LABELS[sort];
}
