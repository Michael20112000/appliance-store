"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { CallbackRequestStatus } from "@/generated/prisma/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { archiveCallbackRequestAction } from "@/server/actions/admin/callback.actions";

type CallbackArchiveButtonProps = {
  id: string;
  status: CallbackRequestStatus;
};

export function CallbackArchiveButton({ id, status }: CallbackArchiveButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const disabled = status !== "CONSULTED" || pending;
  const title =
    status !== "CONSULTED"
      ? "Спочатку позначте як проконсультовано"
      : undefined;

  function onArchive() {
    startTransition(async () => {
      const result = await archiveCallbackRequestAction({ id });
      if (!result.ok) {
        if (result.error === "NOT_CONSULTED") {
          toast.error("Спочатку позначте як проконсультовано");
        } else if (result.error === "ALREADY_ARCHIVED") {
          toast.error("Заявку вже в архіві");
        } else if (result.error === "NOT_FOUND") {
          toast.error("Заявку не знайдено");
        } else {
          toast.error("Не вдалося перенести в архів");
        }
        return;
      }
      toast.success("Заявку перенесено в архів");
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled}
      title={title}
      onClick={onArchive}
    >
      В архів
    </Button>
  );
}
