"use client";

import { useEffect, useRef } from "react";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { useAdminChat } from "@/components/chat/admin-chat-provider";
import { AdminChatComposer } from "@/components/chat/chat-composer";
import { ConversationLifecycleDeleteDialog } from "@/components/chat/conversation-lifecycle-delete-dialog";
import { ConversationLifecycleMenuItems } from "@/components/chat/conversation-lifecycle-menu-items";
import { MessageList } from "@/components/chat/message-list";
import { useConversationLifecycleActions } from "@/components/chat/use-conversation-lifecycle-actions";
import { markAdminReadAction } from "@/server/actions/chat.actions";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();
  const {
    selectedConversationId,
    selectedConversation,
    messages,
    isLoading,
    loadError,
    isDisconnected,
    refetchMessages,
    markConversationReadLocally,
    refreshAfterRead,
  } = useAdminChat();

  const markedReadRef = useRef<string | null>(null);

  const lifecycle = useConversationLifecycleActions(
    selectedConversationId ?? "",
  );

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
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-12 text-center">
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
  const { pending, deleteOpen, setDeleteOpen } = lifecycle;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-start gap-2 border-b border-border px-4 py-3">
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
            <ConversationLifecycleMenuItems
              Item={DropdownMenuItem}
              view={lifecycle.view}
              status={selectedConversation.status}
              pending={pending}
              onArchive={lifecycle.handleArchive}
              onUnarchive={lifecycle.handleUnarchive}
              onRequestDelete={() => setDeleteOpen(true)}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isDisconnected ? (
        <div className="shrink-0 border-b border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
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
        useNativeScroll={isMobile}
        isPanelOpen={Boolean(selectedConversationId)}
      />

      {!isArchived ? <AdminChatComposer /> : null}

      <ConversationLifecycleDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        pending={pending}
        onConfirm={lifecycle.handleDelete}
      />
    </div>
  );
}
