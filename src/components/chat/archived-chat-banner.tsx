"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useChat } from "@/components/chat/chat-provider";
import { Button } from "@/components/ui/button";

export function ArchivedChatBanner() {
  const {
    guestToken,
    setConversationId,
    setConversationStatus,
    resetMessages,
    updateGuestToken,
  } = useChat();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartNew = async () => {
    setIsStarting(true);
    try {
      const res = await fetch("/api/chat/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...(guestToken ? { guestToken } : {}) }),
      });
      if (!res.ok) {
        toast.error("Не вдалося створити новий чат. Спробуйте ще раз.");
        return;
      }
      const data = (await res.json()) as {
        conversationId: string;
        guestToken?: string;
      };
      if (data.guestToken) updateGuestToken(data.guestToken);
      resetMessages();
      setConversationId(data.conversationId);
      setConversationStatus("OPEN");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div
      role="status"
      className="border-b border-border bg-muted px-4 py-3"
    >
      <p className="text-sm font-semibold text-foreground">
        Чат завершено
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Ви можете переглядати історію, але нові повідомлення надіслати не можна.
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mt-2"
        disabled={isStarting}
        onClick={() => void handleStartNew()}
      >
        Почати новий чат
      </Button>
    </div>
  );
}
