import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getConversationForBuyer } from "@/server/services/chat.service";
import { ChatProvider } from "@/components/chat/chat-provider";

export async function ChatProviderGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const hasSession = Boolean(session?.user);
  let initialConversationId: string | undefined;
  let initialUnreadFromStore = false;

  if (session?.user) {
    const conversation = await getConversationForBuyer(session.user.id);
    if (conversation) {
      initialConversationId = conversation.id;
      initialUnreadFromStore =
        conversation.lastMessageSender === "STORE" &&
        conversation.lastMessageAt !== null &&
        conversation.lastMessageAt > conversation.buyerLastReadAt;
    }
  }

  return (
    <ChatProvider
      hasSession={hasSession}
      initialConversationId={initialConversationId}
      initialUnreadFromStore={initialUnreadFromStore}
    >
      {children}
    </ChatProvider>
  );
}
