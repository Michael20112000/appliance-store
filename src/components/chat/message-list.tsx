"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "@/components/chat/message-bubble";
import type { ChatMessage } from "@/components/chat/chat-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

type MessageListProps = {
  messages: ChatMessage[];
  isLoading: boolean;
  loadError: string | null;
};

export function MessageList({ messages, isLoading, loadError }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (loadError) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 text-center text-sm text-destructive">
        {loadError}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-3 px-4 py-4" aria-busy="true">
        <Skeleton className="ml-auto h-12 w-2/3 rounded-2xl" />
        <Skeleton className="h-12 w-2/3 rounded-2xl" />
        <Skeleton className="ml-auto h-12 w-1/2 rounded-2xl" />
        <Skeleton className="h-10 w-3/5 rounded-2xl" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
        <p className="text-sm font-semibold">Напишіть нам</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Маєте питання про товар чи замовлення? Ми відповімо тут.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div
        className="flex flex-col gap-2 px-4 py-4"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
