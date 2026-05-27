"use client";

import { MessageSquare } from "lucide-react";
import { useChat } from "@/components/chat/chat-provider";
import { cn } from "@/lib/utils";

export function ChatFab() {
  const { isOpen, unreadCount, openPanel, hasSession } = useChat();

  if (isOpen) return null;

  return (
    <button
      type="button"
      onClick={() => openPanel()}
      className={cn(
        "fixed bottom-6 right-6 z-[60] flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg",
        "pb-[max(0px,env(safe-area-inset-bottom))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
      aria-label="Відкрити чат з магазином"
    >
      <MessageSquare className="size-6" aria-hidden />
      {hasSession && unreadCount > 0 ? (
        <span
          className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-primary ring-2 ring-background"
          aria-hidden
        />
      ) : null}
    </button>
  );
}
