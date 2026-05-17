import { formatPriceKopiyky } from "@/lib/catalog/format";
import type { CartLineDto } from "@/types/cart";

type CheckoutOrderSummaryProps = {
  items: CartLineDto[];
  subtotalKopiyky: number;
};

export function CheckoutOrderSummary({
  items,
  subtotalKopiyky,
}: CheckoutOrderSummaryProps) {
  return (
    <aside className="rounded-lg border border-border bg-muted/30 p-6 md:sticky md:top-20">
      <h2 className="text-lg font-medium">Ваше замовлення</h2>
      <ul className="mt-4 space-y-3 text-sm">
        {items.map((line) => (
          <li key={line.productId} className="flex justify-between gap-4">
            <span className="line-clamp-2">{line.title}</span>
            <span className="shrink-0 tabular-nums">
              {formatPriceKopiyky(line.priceKopiyky)}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-border pt-4 text-xl font-semibold tabular-nums">
        Разом: {formatPriceKopiyky(subtotalKopiyky)}
      </p>
    </aside>
  );
}
