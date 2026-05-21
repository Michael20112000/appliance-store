"use client";

import { Textarea } from "@/components/ui/textarea";
import { useCallbackNoteAutoSave } from "@/hooks/admin/use-callback-note-auto-save";

type CallbackNoteFieldProps = {
  id: string;
  note: string | null;
};

export function CallbackNoteField({ id, note }: CallbackNoteFieldProps) {
  const { value, setValue, status } = useCallbackNoteAutoSave(id, note);

  return (
    <div className="flex min-w-[16rem] max-w-md flex-col gap-2">
      <Textarea
        rows={3}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Нотатка для оператора"
      />
      <p className="min-h-5 text-xs text-muted-foreground" aria-live="polite">
        {status === "saving" ? "Збереження…" : null}
        {status === "saved" ? "Збережено" : null}
      </p>
    </div>
  );
}
