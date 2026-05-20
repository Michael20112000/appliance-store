import { toast } from "sonner";

export const ORDER_STATUS_ERROR_MESSAGES: Record<string, string> = {
  INVALID_STATUS_TRANSITION: "Недопустима зміна статусу для цього замовлення.",
  INSUFFICIENT_STOCK: "Недостатньо товару на складі для підтвердження.",
  ORDER_NOT_FOUND: "Замовлення не знайдено.",
  UNKNOWN: "Не вдалося оновити статус. Спробуйте ще раз.",
};

export const ORDER_STATUS_ERROR_DESCRIPTIONS: Partial<Record<string, string>> = {
  INSUFFICIENT_STOCK:
    "Збільште кількість товару в адмінці або скасуйте замовлення.",
};

export function showOrderStatusErrorToast(errorCode: string): void {
  const title =
    ORDER_STATUS_ERROR_MESSAGES[errorCode] ??
    ORDER_STATUS_ERROR_MESSAGES.UNKNOWN;
  const description = ORDER_STATUS_ERROR_DESCRIPTIONS[errorCode];

  if (description) {
    toast.error(title, { description });
    return;
  }

  toast.error(title);
}
