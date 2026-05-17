import type { Metadata } from "next";
import { headers } from "next/headers";
import { GuestWishlistView } from "@/components/wishlist/guest-wishlist-view";
import { WishlistPageContent } from "@/components/wishlist/wishlist-page-content";
import { auth } from "@/lib/auth";
import { listWishlistForUser } from "@/server/services/wishlist.service";

export const metadata: Metadata = {
  title: "Обране",
};

export default async function ObranePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session?.user) {
    const { lines } = await listWishlistForUser(session.user.id);
    return <WishlistPageContent lines={lines} hasSession />;
  }

  return <GuestWishlistView />;
}
