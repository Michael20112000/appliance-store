"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createDebounce } from "@/lib/debounce";
import { updateCallbackNoteAction } from "@/server/actions/admin/callback.actions";

export type SaveStatus = "idle" | "saving" | "saved";

const SAVED_DISPLAY_MS = 2000;
const DEBOUNCE_MS = 400;

const errorMessages: Record<string, string> = {
  ALREADY_ARCHIVED: "Заявку вже в архіві",
  NOT_FOUND: "Заявку не знайдено",
  UNKNOWN: "Не вдалося зберегти нотатку",
};

export function useCallbackNoteAutoSave(id: string, initialNote: string | null) {
  const initial = initialNote ?? "";
  const [value, setValue] = useState(initial);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const snapshotRef = useRef(initial);
  const generationRef = useRef(0);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const debounceRef = useRef(createDebounce(DEBOUNCE_MS));
  const saveChainRef = useRef(Promise.resolve());
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    const next = initialNote ?? "";
    snapshotRef.current = next;
    setValue(next);
  }, [id, initialNote]);

  useEffect(() => {
    const debounce = debounceRef.current;
    return () => {
      debounce.cancel();
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
    };
  }, []);

  const runSave = useCallback(() => {
    saveChainRef.current = saveChainRef.current
      .then(async () => {
        const noteToSave = valueRef.current;
        if (noteToSave === snapshotRef.current) return;

        const generation = ++generationRef.current;
        setStatus("saving");

        const result = await updateCallbackNoteAction({
          id,
          note: noteToSave,
        });

        if (generation !== generationRef.current) return;

        if (!result.ok) {
          toast.error(
            errorMessages[result.error] ?? errorMessages.UNKNOWN,
          );
          setStatus("idle");
          return;
        }

        snapshotRef.current = noteToSave;
        setStatus("saved");
        if (savedTimeoutRef.current) {
          clearTimeout(savedTimeoutRef.current);
        }
        savedTimeoutRef.current = setTimeout(
          () => setStatus("idle"),
          SAVED_DISPLAY_MS,
        );
      })
      .catch(() => {
        setStatus("idle");
      });
  }, [id]);

  useEffect(() => {
    debounceRef.current(() => {
      runSave();
    });
  }, [value, runSave]);

  return { value, setValue, status };
}
