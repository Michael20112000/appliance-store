import type { Metadata } from "next";
import { AdminChatInbox } from "@/components/chat/admin-chat-inbox";
import { listConversationsForAdmin } from "@/server/services/chat.service";
import type { ConversationStatus } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Чати",
};

type AdminChatyPageProps = {
  searchParams: Promise<{
    view?: string;
    conversationId?: string;
  }>;
};

export default async function AdminChatyPage({
  searchParams,
}: AdminChatyPageProps) {
  const params = await searchParams;
  const isArchive = params.view === "archive";
  const status: ConversationStatus = isArchive ? "ARCHIVED" : "OPEN";
  const view = isArchive ? "archive" : "active";
  const conversations = await listConversationsForAdmin({ status });

  return (
    <AdminChatInbox
      conversations={conversations}
      view={view}
      initialConversationId={params.conversationId ?? null}
    />
  );
}
