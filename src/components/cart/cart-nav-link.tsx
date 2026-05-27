import { getCartItemCount } from "@/server/services/cart.service";
import { CartNavButton } from "./cart-nav-button";

type CartNavLinkProps = {
  userId: string;
};

export async function CartNavLink({ userId }: CartNavLinkProps) {
  const count = await getCartItemCount(userId);

  return <CartNavButton initialCount={count} />;
}
