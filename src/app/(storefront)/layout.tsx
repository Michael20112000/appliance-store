import { NuqsAdapter } from "nuqs/adapters/next/app";
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
        <NuqsAdapter>{children}</NuqsAdapter>
      </main>
      <StoreFooter />
    </>
  );
}
