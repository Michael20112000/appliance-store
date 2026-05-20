"use client";

import {
  StorefrontAuthLinks,
  type StorefrontAuthSession,
} from "@/components/layout/storefront-auth-links";

type StoreHeaderAuthProps = {
  session: StorefrontAuthSession;
};

export function StoreHeaderAuth({ session }: StoreHeaderAuthProps) {
  return <StorefrontAuthLinks session={session} />;
}
