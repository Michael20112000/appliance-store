import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { CartPendingMerge } from "@/components/cart/cart-pending-merge";

export async function CartPendingMergeGate() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  return <CartPendingMerge />;
}
