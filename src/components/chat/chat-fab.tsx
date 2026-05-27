"use client";

import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useChat } from "@/components/chat/chat-provider";
import { cn } from "@/lib/utils";

export function ChatFab() {
  const { isOpen, unreadCount, openPanel } = useChat();
  const chatBadgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);

  if (isOpen) return null;

  return (
    <button
      type="button"
      onClick={() => openPanel()}
      className={cn(
        "fixed bottom-6 right-6 z-[60] flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg",
        "pb-[max(0px,env(safe-area-inset-bottom))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring relative",
      )}
      aria-label={
        unreadCount > 0
          ? `Відкрити чат з магазином, ${unreadCount} непрочитаних`
          : "Відкрити чат з магазином"
      }
    >
      <MessageSquare className="size-6" aria-hidden />
      {unreadCount > 0 && (
        <Badge
          className="absolute -right-0.5 -top-0.5 min-w-5 justify-center px-1 text-[10px]"
          aria-hidden
        >
          {chatBadgeLabel}
        </Badge>
      )}
    </button>
  );
}
