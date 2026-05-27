import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import type { ConversationStatus } from "@/generated/prisma/client";
import {
  countUnreadForBuyer,
  getConversationForBuyer,
} from "@/server/services/chat.service";
import { ChatProvider } from "@/components/chat/chat-provider";
import type { PublicStorePhone } from "@/server/services/store-settings.service";

export async function ChatProviderGate({
  children,
  phones,
  initialCartCount,
}: {
  children: React.ReactNode;
  phones: PublicStorePhone[];
  initialCartCount: number;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const hasSession = Boolean(session?.user);
  let initialConversationId: string | undefined;
  let initialConversationStatus: ConversationStatus | undefined;
  let initialUnreadCount = 0;

  if (session?.user) {
    const conversation = await getConversationForBuyer(session.user.id);
    if (conversation) {
      initialConversationId = conversation.id;
      initialConversationStatus = conversation.status;
      initialUnreadCount = await countUnreadForBuyer(
        conversation.id,
        conversation.buyerLastReadAt,
      );
    }
  }

  return (
    <ChatProvider
      hasSession={hasSession}
      initialConversationId={initialConversationId}
      initialConversationStatus={initialConversationStatus}
      initialUnreadCount={initialUnreadCount}
      phones={phones}
      initialCartCount={initialCartCount}
    >
      {children}
    </ChatProvider>
  );
}
