"use client";

import { useRouter } from "next/navigation";
import { useTransition, type MouseEvent } from "react";
import type { CallbackRequestStatus } from "@/generated/prisma/client";
import { toast } from "sonner";
import { CALLBACK_STATUS_LABELS_UA } from "@/lib/callback/status-labels";
import { cn } from "@/lib/utils";
import { updateCallbackStatusAction } from "@/server/actions/admin/callback.actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statuses: CallbackRequestStatus[] = ["PENDING", "CONSULTED"];

function statusAccentClass(status: CallbackRequestStatus): string {
  if (status === "PENDING") return "border-amber-500/50 bg-amber-500/10";
  return "border-emerald-500/50 bg-emerald-500/10";
}

type CallbackListStatusSelectProps = {
  id: string;
  status: CallbackRequestStatus;
};

export function CallbackListStatusSelect({
  id,
  status,
}: CallbackListStatusSelectProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const stopRowNav = (event: MouseEvent) => event.stopPropagation();

  function onStatusChange(next: CallbackRequestStatus) {
    if (next === status) return;

    startTransition(async () => {
      const result = await updateCallbackStatusAction({ id, status: next });
      if (!result.ok) {
        if (result.error === "NOT_CONSULTED") {
          toast.error("Спочатку позначте як проконсультовано");
        } else if (result.error === "ALREADY_ARCHIVED") {
          toast.error("Заявку вже в архіві");
        } else if (result.error === "NOT_FOUND") {
          toast.error("Заявку не знайдено");
        } else {
          toast.error("Не вдалося оновити статус");
        }
        return;
      }
      toast.success("Статус оновлено");
      router.refresh();
    });
  }

  return (
    <Select
      value={status}
      onValueChange={(value) => onStatusChange(value as CallbackRequestStatus)}
      disabled={pending}
    >
      <SelectTrigger
        size="sm"
        className={cn("min-w-[12rem]", statusAccentClass(status))}
        onClick={stopRowNav}
        onPointerDown={stopRowNav}
      >
        <SelectValue>{CALLBACK_STATUS_LABELS_UA[status]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {statuses.map((value) => (
          <SelectItem key={value} value={value}>
            {CALLBACK_STATUS_LABELS_UA[value]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
