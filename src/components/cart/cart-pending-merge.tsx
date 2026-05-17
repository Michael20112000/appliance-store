"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { clearPending, readPending } from "@/lib/cart/pending-storage";
import { mergePendingCartAction } from "@/server/actions/cart.actions";

export function CartPendingMerge() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const pending = readPending();
    if (pending.items.length === 0) return;

    void mergePendingCartAction(pending.items)
      .then(() => {
        clearPending();
        router.refresh();
      })
      .catch(() => {
        clearPending();
      });
  }, [router]);

  return null;
}
