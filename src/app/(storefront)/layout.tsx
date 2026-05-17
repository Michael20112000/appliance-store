import { Suspense } from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ChatProviderGate } from "@/components/chat/chat-provider-gate";
import { CartPendingMergeGate } from "@/components/cart/cart-pending-merge-gate";
import { StoreFooter } from "@/components/layout/store-footer";
import { StoreHeader } from "@/components/layout/store-header";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StoreHeader />
      <main id="main-content" className="flex-1">
        <NuqsAdapter>
          <Suspense fallback={null}>
            <ChatProviderGate>
              <CartPendingMergeGate />
              {children}
            </ChatProviderGate>
          </Suspense>
        </NuqsAdapter>
      </main>
      <StoreFooter />
    </>
  );
}
