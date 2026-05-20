"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateCallbackNoteAction } from "@/server/actions/admin/callback.actions";

type CallbackNoteFieldProps = {
  id: string;
  note: string | null;
};

export function CallbackNoteField({ id, note }: CallbackNoteFieldProps) {
  const router = useRouter();
  const [value, setValue] = useState(note ?? "");
  const [pending, startTransition] = useTransition();

  function onSave() {
    startTransition(async () => {
      const result = await updateCallbackNoteAction({ id, note: value });
      if (!result.ok) {
        if (result.error === "ALREADY_ARCHIVED") {
          toast.error("Заявку вже в архіві");
        } else if (result.error === "NOT_FOUND") {
          toast.error("Заявку не знайдено");
        } else {
          toast.error("Не вдалося зберегти нотатку");
        }
        return;
      }
      toast.success("Нотатку збережено");
      router.refresh();
    });
  }

  return (
    <div className="flex min-w-[16rem] max-w-md flex-col gap-2">
      <Textarea
        rows={3}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={pending}
        placeholder="Нотатка для оператора"
      />
      <Button type="button" variant="outline" size="sm" onClick={onSave} disabled={pending}>
        Зберегти
      </Button>
    </div>
  );
}
