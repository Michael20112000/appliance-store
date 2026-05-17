"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { OrderStatus } from "@/generated/prisma/client";
import { toast } from "sonner";
import { updateOrderStatusAction } from "@/server/actions/admin/order.actions";
import { ORDER_STATUS_LABELS_UA } from "@/lib/order/status-labels";
import type { AdminOrderDetailDto } from "@/server/services/admin-order.service";
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
import { Label } from "@/components/ui/label";

const errorMessages: Record<string, string> = {
  INVALID_STATUS_TRANSITION: "Недопустима зміна статусу для цього замовлення.",
  ORDER_NOT_FOUND: "Замовлення не знайдено.",
  UNKNOWN: "Не вдалося оновити статус. Спробуйте ще раз.",
};

type OrderStatusSelectProps = {
  order: Pick<AdminOrderDetailDto, "id" | "orderNumber" | "status">;
  allowedNextStatuses: OrderStatus[];
};

export function OrderStatusSelect({
  order,
  allowedNextStatuses,
}: OrderStatusSelectProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(
    null,
  );

  const options = allowedNextStatuses.filter((status) => status !== order.status);

  if (options.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {ORDER_STATUS_LABELS_UA[order.status]} — зміни недоступні
      </p>
    );
  }

  async function applyStatus(status: OrderStatus) {
    const result = await updateOrderStatusAction({
      orderId: order.id,
      status,
    });

    if (!result.ok) {
      toast.error(errorMessages[result.error] ?? errorMessages.UNKNOWN);
      return;
    }

    toast.success("Статус оновлено");
    setSelectedStatus(null);
    setCancelOpen(false);
    router.refresh();
  }

  function handleSelect(value: string | null) {
    if (!value || value === order.status) return;

    const status = value as OrderStatus;
    if (status === "CANCELLED") {
      setSelectedStatus(status);
      setCancelOpen(true);
      return;
    }

    startTransition(() => applyStatus(status));
  }

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="order-status">Статус замовлення</Label>
        <Select
          value={order.status}
          onValueChange={handleSelect}
          disabled={pending}
        >
          <SelectTrigger id="order-status" className="w-full max-w-xs">
            <SelectValue placeholder="Оберіть статус">
              {ORDER_STATUS_LABELS_UA[order.status]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={order.status}>
              {ORDER_STATUS_LABELS_UA[order.status]} (поточний)
            </SelectItem>
            {options.map((status) => (
              <SelectItem key={status} value={status}>
                {ORDER_STATUS_LABELS_UA[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
