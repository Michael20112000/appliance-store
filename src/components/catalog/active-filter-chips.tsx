"use client";

import { X } from "lucide-react";
import { useQueryStates } from "nuqs";
import type { ProductCondition } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import {
  conditionLabelUa,
  formatPriceKopiyky,
} from "@/lib/catalog/format";
import { catalogParsers, catalogUrlKeys } from "@/lib/catalog/search-params";

function priceChipLabel(cinaVid: number | null, cinaDo: number | null): string {
  if (cinaVid != null && cinaDo != null) {
    const from = formatPriceKopiyky(cinaVid * 100).replace(/ ₴$/, "");
    const to = formatPriceKopiyky(cinaDo * 100);
    return `${from} – ${to}`;
  }
  if (cinaVid != null) {
    return `від ${formatPriceKopiyky(cinaVid * 100)}`;
  }
  return `до ${formatPriceKopiyky(cinaDo! * 100)}`;
}

type FilterChipProps = {
  label: string;
  onDismiss: () => void;
};

function FilterChip({ label, onDismiss }: FilterChipProps) {
  return (
    <Badge
      variant="secondary"
      className="h-11 min-h-11 gap-0 rounded-full py-0 pl-3 pr-0 text-sm font-normal"
    >
      <span className="pr-1">{label}</span>
      <button
        type="button"
        className="inline-flex size-11 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full hover:bg-muted/80"
        aria-label={`Прибрати фільтр: ${label}`}
        onClick={onDismiss}
      >
        <X className="size-4" aria-hidden />
      </button>
    </Badge>
  );
}

export function ActiveFilterChips() {
  const [params, setParams] = useQueryStates(catalogParsers, {
    shallow: false,
    urlKeys: catalogUrlKeys,
  });

  const hasPrice = params.cinaVid != null || params.cinaDo != null;
  const hasFilters =
    params.brend != null || hasPrice || params.stan.length > 0;

  if (!hasFilters) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2" role="list" aria-label="Активні фільтри">
      {params.brend != null ? (
        <FilterChip
          label={params.brend}
          onDismiss={() => {
            void setParams({ brend: null, storinka: 1 });
          }}
        />
      ) : null}
      {hasPrice ? (
        <FilterChip
          label={priceChipLabel(params.cinaVid, params.cinaDo)}
          onDismiss={() => {
            void setParams({ cinaVid: null, cinaDo: null, storinka: 1 });
          }}
        />
      ) : null}
      {params.stan.map((condition) => (
        <FilterChip
          key={condition}
          label={conditionLabelUa(condition as ProductCondition)}
          onDismiss={() => {
            void setParams({
              stan: params.stan.filter((c) => c !== condition),
              storinka: 1,
            });
          }}
        />
      ))}
    </div>
  );
}
