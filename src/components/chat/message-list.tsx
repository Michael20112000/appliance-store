"use client";

import { useEffect, useRef, type RefObject } from "react";
import { MessageBubble } from "@/components/chat/message-bubble";
import type { ChatMessage } from "@/components/chat/chat-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

type MessageListProps = {
  messages: ChatMessage[];
  isLoading: boolean;
  loadError: string | null;
  buyerDisplayName?: string;
  emptyTitle?: string;
  emptyBody?: string;
  /** Native overflow scroll for mobile Sheet (touch-friendly). */
  useNativeScroll?: boolean;
  /** When true, scroll to latest messages on open and after load. */
  isPanelOpen?: boolean;
};

function isNearBottom(el: HTMLElement) {
  return el.scrollHeight - el.scrollTop - el.clientHeight < 96;
}

function scrollMessagesToEnd(
  bottomRef: RefObject<HTMLDivElement | null>,
  scrollRef: RefObject<HTMLDivElement | null>,
  useNativeScroll: boolean,
) {
  if (useNativeScroll && scrollRef.current) {
    const el = scrollRef.current;
    el.scrollTop = el.scrollHeight;
    return;
  }
  bottomRef.current?.scrollIntoView({ behavior: "instant", block: "end" });
}

function getScrollContainer(
  bottomRef: RefObject<HTMLDivElement | null>,
  scrollRef: RefObject<HTMLDivElement | null>,
  useNativeScroll: boolean,
): HTMLElement | null {
  if (useNativeScroll) return scrollRef.current;
  return bottomRef.current?.closest(
    '[data-slot="scroll-area-viewport"]',
  ) as HTMLElement | null;
}

export function MessageList({
  messages,
  isLoading,
  loadError,
  buyerDisplayName,
  emptyTitle = "Напишіть нам",
  emptyBody = "Маєте питання про товар чи замовлення? Ми відповімо тут.",
  useNativeScroll = false,
  isPanelOpen = false,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevPanelOpenRef = useRef(isPanelOpen);
  const prevLoadingRef = useRef(isLoading);

  useEffect(() => {
    const justOpened = isPanelOpen && !prevPanelOpenRef.current;
    const loadJustFinished = isPanelOpen && prevLoadingRef.current && !isLoading;
    prevPanelOpenRef.current = isPanelOpen;
    prevLoadingRef.current = isLoading;

    if (!isPanelOpen || isLoading || loadError) return;
    if (!justOpened && !loadJustFinished) return;

    const run = () => scrollMessagesToEnd(bottomRef, scrollRef, useNativeScroll);
    run();
    const frame = requestAnimationFrame(() => {
      run();
      requestAnimationFrame(run);
    });
    return () => cancelAnimationFrame(frame);
  }, [isPanelOpen, isLoading, loadError, messages.length, useNativeScroll]);

  useEffect(() => {
    if (!isPanelOpen || isLoading || loadError) return;

    const scrollContainer = getScrollContainer(
      bottomRef,
      scrollRef,
      useNativeScroll,
    );
    if (scrollContainer && !isNearBottom(scrollContainer)) return;

    scrollMessagesToEnd(bottomRef, scrollRef, useNativeScroll);
  }, [messages, isPanelOpen, isLoading, loadError, useNativeScroll]);

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
        <p className="text-sm font-semibold">{emptyTitle}</p>
        <p className="mt-2 text-sm text-muted-foreground">{emptyBody}</p>
      </div>
    );
  }

  const thread = (
    <div
      className="flex flex-col gap-2 px-4 py-4"
      aria-live="polite"
      aria-relevant="additions"
    >
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          buyerDisplayName={buyerDisplayName}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );

  if (useNativeScroll) {
    return (
      <div
        ref={scrollRef}
        className="h-0 min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain"
      >
        {thread}
      </div>
    );
  }

  return <ScrollArea className="min-h-0 flex-1">{thread}</ScrollArea>;
}
