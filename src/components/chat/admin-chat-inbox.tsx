"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminChatProvider, useAdminChat } from "@/components/chat/admin-chat-provider";
import { ChatThread } from "@/components/chat/chat-thread";
import { ConversationList } from "@/components/chat/conversation-list";
import { cn } from "@/lib/utils";
import { buildAdminChatHref, type AdminChatView } from "@/lib/admin-chat-url";
import { tabsListVariants } from "@/components/ui/tabs";
import type { ConversationSummaryDto } from "@/types/chat";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isMobile;
}

function AdminChatTabs({
  view,
  conversationId,
}: {
  view: AdminChatView;
  conversationId: string | null;
}) {
  const tabClassName =
    "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-all hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring";

  return (
    <div
      className={cn(tabsListVariants(), "w-full max-w-md")}
      role="tablist"
      aria-label="Фільтр діалогів"
    >
      <Link
        href={buildAdminChatHref("active", conversationId)}
        role="tab"
        aria-selected={view === "active"}
        className={cn(
          tabClassName,
          view === "active" &&
            "bg-background text-foreground shadow-sm dark:border-input dark:bg-input/30",
        )}
      >
        Активні
      </Link>
      <Link
        href={buildAdminChatHref("archive", conversationId)}
        role="tab"
        aria-selected={view === "archive"}
        className={cn(
          tabClassName,
          view === "archive" &&
            "bg-background text-foreground shadow-sm dark:border-input dark:bg-input/30",
        )}
      >
        Архів
      </Link>
    </div>
  );
}

function AdminChatInboxInner() {
  const isMobile = useIsMobile();
  const {
    view,
    conversations,
    selectedConversationId,
    setSelectedConversationId,
  } = useAdminChat();

  const showList = !isMobile || !selectedConversationId;
  const showThread = !isMobile || Boolean(selectedConversationId);

  const emptyTitle =
    view === "archive" ? "Архів порожній" : "Немає активних діалогів";
  const emptyBody =
    view === "archive"
      ? "Архівовані діалоги зʼявляться тут після архівації."
      : "Коли покупець напише, діалог зʼявиться тут.";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Чати</h1>
      <AdminChatTabs view={view} conversationId={selectedConversationId} />
      <div className="grid min-h-[calc(100dvh-12rem)] overflow-hidden rounded-lg border border-border md:grid-cols-[320px_1fr]">
        {showList ? (
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversationId}
            onSelect={setSelectedConversationId}
            showUnreadHighlight={view === "active"}
            emptyTitle={emptyTitle}
            emptyBody={emptyBody}
          />
        ) : null}
        {showThread ? (
          <ChatThread
            onBack={
              isMobile ? () => setSelectedConversationId(null) : undefined
            }
          />
        ) : null}
      </div>
    </div>
  );
}

type AdminChatInboxProps = {
  conversations: ConversationSummaryDto[];
  view: AdminChatView;
  initialConversationId?: string | null;
};

export function AdminChatInbox({
  conversations,
  view,
  initialConversationId = null,
}: AdminChatInboxProps) {
  const resolvedConversationId =
    initialConversationId &&
    conversations.some((item) => item.id === initialConversationId)
      ? initialConversationId
      : null;

  return (
    <AdminChatProvider
      key={view}
      conversations={conversations}
      view={view}
      initialConversationId={resolvedConversationId}
    >
      <AdminChatInboxInner />
    </AdminChatProvider>
  );
}
