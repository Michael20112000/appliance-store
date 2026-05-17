import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CartEmpty() {
  return (
    <div className="rounded-lg border border-dashed p-10 text-center">
      <h2 className="text-lg font-medium">Кошик порожній</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Додайте товари з каталогу — ми збережемо їх тут до оформлення.
      </p>
      <Link href="/katalog" className={cn(buttonVariants(), "mt-6 inline-flex")}>
        До каталогу
      </Link>
    </div>
  );
}
