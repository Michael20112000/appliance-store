import type { Metadata } from "next";
import { AdminChatInbox } from "@/components/chat/admin-chat-inbox";
import { listConversationsForAdmin } from "@/server/services/chat.service";

export const metadata: Metadata = {
  title: "Чати",
};

export default async function AdminChatyPage() {
  const conversations = await listConversationsForAdmin({ status: "OPEN" });

  return <AdminChatInbox conversations={conversations} />;
}
