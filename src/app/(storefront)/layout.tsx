import { Suspense } from "react";
import { headers } from "next/headers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import { ChatProviderGate } from "@/components/chat/chat-provider-gate";
import { CartPendingMergeGate } from "@/components/cart/cart-pending-merge-gate";
import { WishlistPendingMergeGate } from "@/components/wishlist/wishlist-pending-merge-gate";
import { StoreFooter } from "@/components/layout/store-footer";
import { StoreHeader } from "@/components/layout/store-header";
import { PageTransition } from "@/components/layout/page-transition";
import { Analytics } from "@vercel/analytics/next";
import { auth } from "@/lib/auth";
import { getPublicStoreContacts } from "@/server/services/store-settings.service";
import { getCartItemCount } from "@/server/services/cart.service";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const contacts = await getPublicStoreContacts();
  const cartCount = session?.user ? await getCartItemCount(session.user.id) : 0;

  return (
    <>
      <NuqsAdapter>
        <Suspense fallback={null}>
          <ChatProviderGate phones={contacts.phones} initialCartCount={cartCount}>
            <StoreHeader />
            <main id="main-content" className="flex-1">
              <PageTransition>
                <CartPendingMergeGate />
                <WishlistPendingMergeGate />
                {children}
                <Analytics />
              </PageTransition>
            </main>
          </ChatProviderGate>
        </Suspense>
      </NuqsAdapter>
      <StoreFooter />
      <Toaster richColors position="top-center" closeButton />
    </>
  );
}
