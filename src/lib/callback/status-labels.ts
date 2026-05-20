import type { CallbackRequestStatus } from "@/generated/prisma/client";

export const CALLBACK_STATUS_LABELS_UA: Record<CallbackRequestStatus, string> =
  {
    PENDING: "Очікує на дзвінок",
    CONSULTED: "Проконсультовано",
  };
