"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useChat } from "@/components/chat/chat-provider";
import { ConversationList } from "@/components/chat/conversation-list";
import { Button } from "@/components/ui/button";
import type { ConversationSummaryDto } from "@/types/chat";

export function HistoryDrawer() {
  const {
    conversationId,
    setConversationId,
    setConversationStatus,
    resetMessages,
    closeHistory,
  } = useChat();

  const [conversations, setConversations] = useState<ConversationSummaryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/chat/conversations");
        if (response.ok) {
          const data = (await response.json()) as {
            conversations: ConversationSummaryDto[];
          };
          setConversations(data.conversations);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSelect = (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return;
    resetMessages();
    setConversationId(id);
    setConversationStatus(conv.status);
    closeHistory();
  };

  const handleNewChat = async () => {
    const response = await fetch("/api/chat/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    if (!response.ok) return;
    const data = (await response.json()) as { conversationId: string };
    resetMessages();
    setConversationId(data.conversationId);
    setConversationStatus("OPEN");
    closeHistory();
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <Button type="button" variant="ghost" size="sm" onClick={closeHistory}>
          <ArrowLeft className="mr-1 size-4" /> Назад
        </Button>
        <p className="text-sm font-semibold">Мої чати</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void handleNewChat()}
        >
          <Plus className="mr-1 size-4" /> Новий чат
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ConversationList
          conversations={conversations}
          selectedId={conversationId}
          isLoading={isLoading}
          enableContextMenu={false}
          showUnreadHighlight={false}
          onSelect={handleSelect}
          emptyTitle="Ще немає чатів"
          emptyBody="Розпочніть розмову з магазином."
        />
      </div>
    </div>
  );
}
