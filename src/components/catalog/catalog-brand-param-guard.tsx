"use client";

import { useEffect } from "react";
import { useQueryStates } from "nuqs";
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
    if (params.brend != null && !brands.includes(params.brend)) {
      void setParams({ brend: null, storinka: 1 }, { history: "replace" });
    }
  }, [params.brend, brands, setParams]);

  return null;
}
