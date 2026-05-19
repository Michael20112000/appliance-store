"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearPending } from "@/lib/cart/pending-storage";
import { persistGuestOrderAccessAction } from "@/server/actions/order.actions";

type GuestOrderCleanupProps = {
  orderNumber: string;
  guestAccessToken?: string;
};

export function GuestOrderCleanup({
  orderNumber,
  guestAccessToken,
}: GuestOrderCleanupProps) {
  const router = useRouter();

  useEffect(() => {
    clearPending();

    if (!guestAccessToken) {
      return;
    }

    void persistGuestOrderAccessAction(orderNumber, guestAccessToken).then(() => {
      router.replace(`/zamovlennia/pidtverdzhennia/${orderNumber}`);
    });
  }, [guestAccessToken, orderNumber, router]);

  return null;
}
