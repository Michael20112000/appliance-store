import type {
  ConversationStatus,
  MessageSender,
} from "@/generated/prisma/client";

export type ChatAttachment = {
  publicId: string;
  resourceType: "image" | "raw";
  url: string;
  filename: string;
  bytes: number;
};

export type MessageDto = {
  id: string;
  conversationId: string;
  body: string;
  senderRole: MessageSender;
  senderId: string;
  createdAt: string;
  attachments?: ChatAttachment[];
};

export type ConversationSummaryDto = {
  id: string;
  userId: string | null;
  status: ConversationStatus;
  buyerName: string;
  buyerEmail: string;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadForAdmin: boolean;
};
