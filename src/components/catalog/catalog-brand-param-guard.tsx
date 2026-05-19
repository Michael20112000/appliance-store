"use client";

import { useEffect } from "react";
import { useQueryStates } from "nuqs";
import { brandSelectToUrlParam } from "@/lib/catalog/catalog-labels";
import { catalogParsers, catalogUrlKeys } from "@/lib/catalog/search-params";

type CatalogBrandParamGuardProps = {
  brands: string[];
};

export function CatalogBrandParamGuard({ brands }: CatalogBrandParamGuardProps) {
  const [params, setParams] = useQueryStates(catalogParsers, {
    urlKeys: catalogUrlKeys,
    shallow: false,
  });

  useEffect(() => {
    const normalized = brandSelectToUrlParam(params.brend ?? "");
    if (normalized !== params.brend) {
      void setParams({ brend: normalized, storinka: 1 }, { history: "replace" });
      return;
    }
    if (params.brend != null && !brands.includes(params.brend)) {
      void setParams({ brend: null, storinka: 1 }, { history: "replace" });
    }
  }, [params.brend, brands, setParams]);

  return null;
}
