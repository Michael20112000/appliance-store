import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCartItemCount } from "@/server/services/cart.service";

type CartNavLinkProps = {
  userId: string;
};

export async function CartNavLink({ userId }: CartNavLinkProps) {
  const count = await getCartItemCount(userId);

  return (
    <Link
      href="/koszyk"
      className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-3 text-sm font-medium hover:bg-muted"
      aria-label={`Кошик${count > 0 ? `, ${count} товарів` : ""}`}
    >
      <ShoppingCart className="size-5" />
      {count > 0 ? (
        <Badge className="absolute -right-0.5 -top-0.5 min-w-5 justify-center px-1 text-[10px]">
          {count > 9 ? "9+" : count}
        </Badge>
      ) : null}
    </Link>
  );
}
