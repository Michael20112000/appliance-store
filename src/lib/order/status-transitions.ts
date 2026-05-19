import type { DeliveryType, OrderStatus } from "@/generated/prisma/client";

export const INVALID_STATUS_TRANSITION = "INVALID_STATUS_TRANSITION";

const ALLOWED_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "CANCELLED"],
  READY_FOR_PICKUP: ["COMPLETED", "CANCELLED"],
  OUT_FOR_DELIVERY: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function assertTransitionAllowed(
  from: OrderStatus,
  to: OrderStatus,
): void {
  if (from === to) return;
  const allowed = ALLOWED_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new Error(INVALID_STATUS_TRANSITION);
  }
}

export function getAllowedNextStatuses(from: OrderStatus): OrderStatus[] {
  return [...ALLOWED_TRANSITIONS[from]];
}

export function isStatusCompatibleWithDelivery(
  status: OrderStatus,
  deliveryType: DeliveryType,
): boolean {
  if (status === "OUT_FOR_DELIVERY" && deliveryType === "PICKUP") {
    return false;
  }
  if (status === "READY_FOR_PICKUP" && deliveryType === "LVIV_DELIVERY") {
    return false;
  }
  return true;
}

export function getAllowedNextStatusesForDelivery(
  from: OrderStatus,
  deliveryType: DeliveryType,
): OrderStatus[] {
  return getAllowedNextStatuses(from).filter((status) =>
    isStatusCompatibleWithDelivery(status, deliveryType),
  );
}

export function assertTransitionAllowedForDelivery(
  from: OrderStatus,
  to: OrderStatus,
  deliveryType: DeliveryType,
): void {
  assertTransitionAllowed(from, to);
  if (!isStatusCompatibleWithDelivery(to, deliveryType)) {
    throw new Error(INVALID_STATUS_TRANSITION);
  }
}
