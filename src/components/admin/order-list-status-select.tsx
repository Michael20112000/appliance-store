"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type MouseEvent } from "react";
import type { DeliveryType, OrderStatus } from "@/generated/prisma/client";
import { toast } from "sonner";
import { showOrderStatusErrorToast } from "@/lib/order/admin-status-errors";
import { ORDER_STATUS_LABELS_UA } from "@/lib/order/status-labels";
import { getOrderStatusAccentClass } from "@/lib/order/status-styles";
import { cn } from "@/lib/utils";
import { updateOrderStatusAction } from "@/server/actions/admin/order.actions";
import { getAllowedNextStatusesForDelivery } from "@/lib/order/status-transitions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const listTriggerClassName =
  "min-w-[14rem] w-auto max-w-[18rem] whitespace-nowrap";

type OrderListStatusSelectProps = {
  orderId: string;
  status: OrderStatus;
  deliveryType: DeliveryType;
};

export function OrderListStatusSelect({
  orderId,
  status,
  deliveryType,
}: OrderListStatusSelectProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(
    null,
  );

  const allowedNext = getAllowedNextStatusesForDelivery(status, deliveryType);
  const options = allowedNext.filter((value) => value !== status);

  const stopRowNav = (event: MouseEvent) => event.stopPropagation();

  if (options.length === 0) {
    return (
      <Select value={status} disabled>
        <SelectTrigger
          size="sm"
          className={cn(listTriggerClassName, getOrderStatusAccentClass(status))}
          onClick={stopRowNav}
          onPointerDown={stopRowNav}
        >
          <SelectValue>{ORDER_STATUS_LABELS_UA[status]}</SelectValue>
        </SelectTrigger>
      </Select>
    );
  }

  async function applyStatus(nextStatus: OrderStatus) {
    try {
      const result = await updateOrderStatusAction({
        orderId,
        status: nextStatus,
      });

      if (!result.ok) {
        showOrderStatusErrorToast(result.error);
        return;
      }

      toast.success("Статус оновлено");
      setSelectedStatus(null);
      setCancelOpen(false);
      router.refresh();
    } catch {
      showOrderStatusErrorToast("UNKNOWN");
    }
  }

  function handleSelect(value: string | null) {
    if (!value || value === status) return;

    const nextStatus = value as OrderStatus;
    if (nextStatus === "CANCELLED") {
      setSelectedStatus(nextStatus);
      setCancelOpen(true);
      return;
    }

    startTransition(() => applyStatus(nextStatus));
  }

  return (
    <>
      <Select value={status} onValueChange={handleSelect} disabled={pending}>
        <SelectTrigger
          size="sm"
          className={cn(listTriggerClassName, getOrderStatusAccentClass(status))}
          onClick={stopRowNav}
          onPointerDown={stopRowNav}
        >
          <SelectValue>{ORDER_STATUS_LABELS_UA[status]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={status}>
            {ORDER_STATUS_LABELS_UA[status]} (поточний)
          </SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {ORDER_STATUS_LABELS_UA[option]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Скасувати замовлення?</AlertDialogTitle>
            <AlertDialogDescription>
              Товари повернуться в наявність.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Ні</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={() => {
                if (selectedStatus) {
                  startTransition(() => applyStatus(selectedStatus));
                }
              }}
            >
              Так, скасувати
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
