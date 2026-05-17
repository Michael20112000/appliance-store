"use client";

import { useEffect, useState } from "react";
import { AdminChatProvider, useAdminChat } from "@/components/chat/admin-chat-provider";
import { ChatThread } from "@/components/chat/chat-thread";
import { ConversationList } from "@/components/chat/conversation-list";
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

function AdminChatInboxInner() {
  const isMobile = useIsMobile();
  const {
    conversations,
    selectedConversationId,
    setSelectedConversationId,
  } = useAdminChat();

  const showList = !isMobile || !selectedConversationId;
  const showThread = !isMobile || Boolean(selectedConversationId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Чати</h1>
      <div className="grid min-h-[calc(100dvh-12rem)] overflow-hidden rounded-lg border border-border md:grid-cols-[320px_1fr]">
        {showList ? (
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversationId}
            onSelect={setSelectedConversationId}
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
};

export function AdminChatInbox({ conversations }: AdminChatInboxProps) {
  return (
    <AdminChatProvider conversations={conversations}>
      <AdminChatInboxInner />
    </AdminChatProvider>
  );
}
