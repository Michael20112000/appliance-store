"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteCategoryFromListAction } from "@/server/actions/admin/category.actions";
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
import { Button } from "@/components/ui/button";

const errorMessages: Record<string, string> = {
  CATEGORY_HAS_PRODUCTS:
    "У категорії є товари. Спочатку перемістіть або видаліть їх.",
  CATEGORY_NOT_FOUND: "Категорію не знайдено.",
  UNKNOWN: "Не вдалося видалити категорію. Спробуйте ще раз.",
};

type CategoryEditDeleteButtonProps = {
  categoryId: string;
};

export function CategoryEditDeleteButton({
  categoryId,
}: CategoryEditDeleteButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteCategoryFromListAction(categoryId);
      if (!result.ok) {
        toast.error(errorMessages[result.error] ?? errorMessages.UNKNOWN);
        return;
      }
      toast.success("Категорію видалено");
      setOpen(false);
      router.push("/admin/kategorii");
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Видалити категорію"
        disabled={pending}
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-4" />
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити категорію?</AlertDialogTitle>
            <AlertDialogDescription>
              Дію не можна скасувати. Якщо в категорії є товари, видалення буде
              заблоковано.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Скасувати</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={handleConfirm}
            >
              Видалити
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
