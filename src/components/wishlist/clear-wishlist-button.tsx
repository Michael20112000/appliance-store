"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { clearGuestWishlist } from "@/lib/wishlist/guest-storage";
import { dispatchWishlistChanged } from "@/lib/wishlist/wishlist-events";
import { clearWishlistAction } from "@/server/actions/wishlist.actions";

type ClearWishlistButtonProps = {
  hasSession: boolean;
  onCleared?: () => void;
};

export function ClearWishlistButton({
  hasSession,
  onCleared,
}: ClearWishlistButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleClear() {
    startTransition(async () => {
      try {
        if (hasSession) {
          await clearWishlistAction();
          dispatchWishlistChanged();
          router.refresh();
        } else {
          clearGuestWishlist();
        }
        onCleared?.();
        setOpen(false);
        toast.success("Обране очищено");
      } catch {
        toast.error("Не вдалося очистити обране");
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant="outline" size="sm" disabled={pending}>
            Очистити обране
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Очистити обране?</AlertDialogTitle>
          <AlertDialogDescription>
            Усі товари будуть прибрані зі списку обраного. Цю дію не можна
            скасувати.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Скасувати</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={handleClear}
          >
            Очистити
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
