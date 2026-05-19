"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type MouseEvent } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { suppressAdminRowNavigation } from "@/lib/admin/clickable-table-row";
import { deleteProductFromListAction } from "@/server/actions/admin/product.actions";
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
  PRODUCT_IN_CART:
    "Товар у кошику покупця — приберіть його з кошиків перед видаленням.",
  PRODUCT_IN_ACTIVE_ORDER:
    "Товар у активному замовленні — завершіть або скасуйте замовлення.",
  PRODUCT_NOT_FOUND: "Товар не знайдено.",
  UNKNOWN: "Не вдалося зберегти товар. Спробуйте ще раз.",
};

type ProductListDeleteButtonProps = {
  productId: string;
};

export function ProductListDeleteButton({
  productId,
}: ProductListDeleteButtonProps) {
  const router = useRouter();
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
      const result = await deleteProductFromListAction(productId);
      if (!result.ok) {
        toast.error(errorMessages[result.error] ?? errorMessages.UNKNOWN);
        return;
      }
      toast.success("Товар видалено");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div data-admin-row-interactive className="inline-flex">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Видалити товар"
        disabled={pending}
        onClick={(event) => {
          stopRowNav(event);
          setOpen(true);
        }}
        onPointerDown={stopRowNav}
      >
        <Trash2 className="size-4" />
      </Button>

      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити товар?</AlertDialogTitle>
            <AlertDialogDescription>
              Дію не можна скасувати, якщо товар не в кошику чи активному
              замовленні.
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
