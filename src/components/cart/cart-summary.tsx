import Link from "next/link";
import { formatPriceKopiyky } from "@/lib/catalog/format";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CartSummaryProps = {
  subtotalKopiyky: number;
  itemCount: number;
};

export function CartSummary({ subtotalKopiyky, itemCount }: CartSummaryProps) {
  return (
    <aside className="rounded-lg border border-border bg-muted/30 p-6 md:sticky md:top-20">
      <h2 className="text-lg font-medium">Підсумок</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {itemCount} {itemCount === 1 ? "товар" : itemCount < 5 ? "товари" : "товарів"}
      </p>
      <p className="mt-4 text-2xl font-semibold tabular-nums">
        {formatPriceKopiyky(subtotalKopiyky)}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        Оплата при отриманні. Магазин передзвонить для підтвердження.
      </p>
      <Link
        href="/zamovlennia"
        className={cn(buttonVariants(), "mt-6 inline-flex w-full justify-center")}
      >
        Оформити замовлення
      </Link>
    </aside>
  );
}
