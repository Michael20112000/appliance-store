"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminProductsUrl } from "@/lib/admin/products-url";
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
  UNKNOWN: "Не вдалося видалити товар. Спробуйте ще раз.",
};

type ProductEditDeleteButtonProps = {
  productId: string;
  categoryId: string | null;
};

export function ProductEditDeleteButton({
  productId,
  categoryId,
}: ProductEditDeleteButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteProductFromListAction(productId);
      if (!result.ok) {
        toast.error(errorMessages[result.error] ?? errorMessages.UNKNOWN);
        return;
      }
      toast.success("Товар видалено");
      setOpen(false);
      router.push(
        categoryId ? adminProductsUrl({ categoryId }) : "/admin/tovary",
      );
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Видалити товар"
        disabled={pending}
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-4" />
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
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
    </>
  );
}
