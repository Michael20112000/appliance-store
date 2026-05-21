"use client";

import { useState, useTransition, type MouseEvent } from "react";
import { toast } from "sonner";
import { suppressAdminRowNavigation } from "@/lib/admin/clickable-table-row";
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
  UNKNOWN: "Не вдалося зберегти категорію. Спробуйте ще раз.",
};

type CategoryTableDeleteButtonProps = {
  categoryId: string;
  onDeleted?: () => void;
};

export function CategoryTableDeleteButton({
  categoryId,
  onDeleted,
}: CategoryTableDeleteButtonProps) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const stopRowNav = (event: MouseEvent) => event.stopPropagation();

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) suppressAdminRowNavigation();
  }

  function handleConfirm() {
    suppressAdminRowNavigation();
    startTransition(async () => {
      const result = await deleteCategoryFromListAction(categoryId);
      if (!result.ok) {
        toast.error(errorMessages[result.error] ?? errorMessages.UNKNOWN);
        setOpen(false);
        return;
      }
      toast.success("Категорію видалено");
      setOpen(false);
      onDeleted?.();
    });
  }

  return (
    <div data-admin-row-interactive className="inline-flex">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-destructive hover:text-destructive"
        disabled={pending}
        onClick={(event) => {
          stopRowNav(event);
          setOpen(true);
        }}
        onPointerDown={stopRowNav}
      >
        Видалити
      </Button>

      <AlertDialog open={open} onOpenChange={handleOpenChange}>
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
    </div>
  );
}
