"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useChat } from "@/components/chat/chat-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ConversationSummaryDto } from "@/types/chat";

const timeFormatter = new Intl.DateTimeFormat("uk-UA", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function formatTime(iso: string | null): string {
  if (!iso) return "";
  return timeFormatter.format(new Date(iso));
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "П";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

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
      <div className="min-h-0 flex-1 overflow-y-auto" role="listbox" aria-label="Мої чати">
        {isLoading ? (
          <div className="flex flex-col gap-1 p-2" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="min-h-14 w-full rounded-md" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <p className="text-sm font-semibold">Ще немає чатів</p>
            <p className="mt-2 text-sm text-muted-foreground">Розпочніть розмову з магазином.</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              type="button"
              role="option"
              aria-selected={conv.id === conversationId}
              onClick={() => handleSelect(conv.id)}
              className={cn(
                "flex min-h-14 w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/50",
                conv.id === conversationId && "bg-muted/70",
              )}
            >
              <Avatar size="sm" className="mt-0.5">
                <AvatarFallback>{initials(conv.buyerName || conv.buyerEmail)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-semibold">{conv.buyerName || conv.buyerEmail || "Ви"}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatTime(conv.lastMessageAt)}</span>
                </div>
                {conv.lastMessagePreview ? (
                  <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{conv.lastMessagePreview}</p>
                ) : null}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
