import { formatPriceKopiyky } from "@/lib/catalog/format";
import { cn } from "@/lib/utils";

type PriceDisplayProps = {
  priceKopiyky: number;
  className?: string;
};

export function PriceDisplay({ priceKopiyky, className }: PriceDisplayProps) {
  return (
    <p
      className={cn(
        "font-semibold tabular-nums tracking-tight text-foreground",
        className,
      )}
    >
      {formatPriceKopiyky(priceKopiyky)}
    </p>
  );
}
