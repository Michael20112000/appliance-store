"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { useAdminChat } from "@/components/chat/admin-chat-provider";
import { AdminChatComposer } from "@/components/chat/chat-composer";
import { MessageList } from "@/components/chat/message-list";
import { markAdminReadAction } from "@/server/actions/chat.actions";
import {
  archiveConversationAction,
  deleteConversationAction,
  unarchiveConversationAction,
} from "@/server/actions/admin/chat.actions";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ChatThreadProps = {
  onBack?: () => void;
};

export function ChatThread({ onBack }: ChatThreadProps) {
  const {
    view,
    selectedConversationId,
    selectedConversation,
    messages,
    isLoading,
    loadError,
    isDisconnected,
    refetchMessages,
    markConversationReadLocally,
    refreshAfterRead,
    clearSelectionAndRefresh,
    refreshInbox,
  } = useAdminChat();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const markedReadRef = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedConversationId) {
      markedReadRef.current = null;
      return;
    }

    if (markedReadRef.current === selectedConversationId) return;
    markedReadRef.current = selectedConversationId;

    markConversationReadLocally(selectedConversationId);

    void markAdminReadAction(selectedConversationId).then((result) => {
      if (result.ok) {
        refreshAfterRead();
      }
    });
  }, [
    markConversationReadLocally,
    refreshAfterRead,
    selectedConversationId,
  ]);

  if (!selectedConversationId || !selectedConversation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <p className="text-sm font-semibold text-muted-foreground">
          Оберіть діалог
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Оберіть покупця зі списку, щоб відповісти.
        </p>
      </div>
    );
  }

  const buyerDisplayName =
    selectedConversation.buyerName || selectedConversation.buyerEmail;
  const isArchived = selectedConversation.status === "ARCHIVED";

  const handleArchive = () => {
    startTransition(async () => {
      try {
        await archiveConversationAction(selectedConversationId);
        toast.success("Діалог архівовано");
        clearSelectionAndRefresh();
      } catch {
        toast.error("Не вдалося архівувати діалог");
      }
    });
  };

  const handleUnarchive = () => {
    startTransition(async () => {
      try {
        await unarchiveConversationAction(selectedConversationId);
        toast.success("Діалог повернуто в активні");
        refreshInbox();
      } catch {
        toast.error("Не вдалося повернути діалог з архіву");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteConversationAction(selectedConversationId);
        toast.success("Діалог видалено");
        setDeleteOpen(false);
        clearSelectionAndRefresh();
      } catch {
        toast.error("Не вдалося видалити діалог");
      }
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-start gap-2 border-b border-border px-4 py-3">
        {onBack ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-0.5 shrink-0 px-2"
            onClick={onBack}
          >
            <ArrowLeft className="mr-1 size-4" aria-hidden />
            До списку
          </Button>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{buyerDisplayName}</p>
          {selectedConversation.buyerEmail ? (
            <p className="truncate text-xs text-muted-foreground">
              {selectedConversation.buyerEmail}
            </p>
          ) : null}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11 shrink-0"
                aria-label="Дії з діалогом"
                disabled={pending}
              />
            }
          >
            <MoreVertical className="size-4" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {view === "active" && selectedConversation.status === "OPEN" ? (
              <DropdownMenuItem onClick={handleArchive} disabled={pending}>
                Архівувати
              </DropdownMenuItem>
            ) : null}
            {view === "archive" && isArchived ? (
              <DropdownMenuItem onClick={handleUnarchive} disabled={pending}>
                Повернути з архіву
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
              disabled={pending}
            >
              Видалити назавжди
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isDisconnected ? (
        <div className="border-b border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
          <p>Зʼєднання перервано. Повідомлення можуть затримуватися.</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-1 h-auto px-0 text-sm"
            onClick={() => void refetchMessages()}
          >
            Оновити
          </Button>
        </div>
      ) : null}

      <MessageList
        messages={messages}
        isLoading={isLoading}
        loadError={loadError}
        buyerDisplayName={buyerDisplayName}
        emptyTitle="Ще немає повідомлень"
        emptyBody="Надішліть відповідь покупцю."
      />

      {!isArchived ? <AdminChatComposer /> : null}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити діалог назавжди?</AlertDialogTitle>
            <AlertDialogDescription>
              Усі повідомлення буде видалено без можливості відновлення.
              Покупець більше не побачить цей діалог.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Скасувати</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={handleDelete}
            >
              Видалити
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
