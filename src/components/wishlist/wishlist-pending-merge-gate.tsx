import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { WishlistPendingMerge } from "@/components/wishlist/wishlist-pending-merge";

export async function WishlistPendingMergeGate() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  return <WishlistPendingMerge />;
}
