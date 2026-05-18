"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { getAdminClickableRowProps } from "@/lib/admin/clickable-table-row";

export function useAdminClickableRow(href: string) {
  const router = useRouter();

  return useMemo(
    () =>
      getAdminClickableRowProps({
        href,
        onNavigate: (target) => router.push(target),
      }),
    [href, router],
  );
}
