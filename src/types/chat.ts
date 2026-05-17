import type {
  ConversationStatus,
  MessageSender,
} from "@/generated/prisma/client";

export type MessageDto = {
  id: string;
  conversationId: string;
  body: string;
  senderRole: MessageSender;
  senderId: string;
  createdAt: string;
};

export type ConversationSummaryDto = {
  id: string;
  userId: string;
  status: ConversationStatus;
  buyerName: string;
  buyerEmail: string;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadForAdmin: boolean;
};
