"use client";

import { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { useAdminChat } from "@/components/chat/admin-chat-provider";
import { AdminChatComposer } from "@/components/chat/chat-composer";
import { MessageList } from "@/components/chat/message-list";
import { markAdminReadAction } from "@/server/actions/chat.actions";
import { Button } from "@/components/ui/button";

type ChatThreadProps = {
  onBack?: () => void;
};

export function ChatThread({ onBack }: ChatThreadProps) {
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
      <AdminChatComposer />
    </div>
  );
}
