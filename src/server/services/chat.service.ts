import type { MessageSender } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type {
  ConversationSummaryDto,
  MessageDto,
} from "@/types/chat";

export const CONVERSATION_NOT_FOUND = "CONVERSATION_NOT_FOUND";
export const FORBIDDEN = "FORBIDDEN";
export const CHAT_RATE_LIMIT = "CHAT_RATE_LIMIT";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const MESSAGE_PREVIEW_MAX = 120;
const DEFAULT_MESSAGE_LIMIT = 50;

const CONVERSATION_CHANNEL_RE =
  /^private-conversation-([a-z0-9]{20,30})$/i;

export class ChatServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ChatServiceError";
  }
}

export class ChatRateLimitError extends ChatServiceError {
  constructor() {
    super(
      CHAT_RATE_LIMIT,
      "Занадто багато повідомлень. Спробуйте через хвилину.",
    );
    this.name = "ChatRateLimitError";
  }
}

type ChatSession = {
  user: {
    id: string;
    role?: string | null;
  };
};

type ProductContext = {
  productId?: string;
  productTitle?: string;
};

function messagePreview(body: string): string {
  const trimmed = body.trim();
  if (trimmed.length <= MESSAGE_PREVIEW_MAX) return trimmed;
  return `${trimmed.slice(0, MESSAGE_PREVIEW_MAX - 1)}…`;
}

function mapMessageDto(message: {
  id: string;
  conversationId: string;
  body: string;
  senderRole: MessageSender;
  senderId: string;
  createdAt: Date;
}): MessageDto {
  return {
    id: message.id,
    conversationId: message.conversationId,
    body: message.body,
    senderRole: message.senderRole,
    senderId: message.senderId,
    createdAt: message.createdAt.toISOString(),
  };
}

function isUniqueViolation(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function getOrCreateConversation(
  userId: string,
  context?: ProductContext,
) {
  const existing = await prisma.conversation.findUnique({ where: { userId } });
  if (existing) {
    if (context?.productId || context?.productTitle) {
      return applyProductContextIfEmpty(existing.id, context);
    }
    return existing;
  }

  try {
    return await prisma.conversation.create({
      data: {
        userId,
        contextProductId: context?.productId,
        contextProductTitle: context?.productTitle,
      },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return prisma.conversation.findUniqueOrThrow({ where: { userId } });
    }
    throw error;
  }
}

async function applyProductContextIfEmpty(
  conversationId: string,
  context?: ProductContext,
) {
  if (!context?.productId && !context?.productTitle) {
    return prisma.conversation.findUniqueOrThrow({
      where: { id: conversationId },
    });
  }

  const current = await prisma.conversation.findUniqueOrThrow({
    where: { id: conversationId },
  });

  if (current.contextProductId || current.contextProductTitle) {
    return current;
  }

  return prisma.conversation.update({
    where: { id: conversationId },
    data: {
      contextProductId: context.productId,
      contextProductTitle: context.productTitle,
    },
  });
}

export async function getConversationForBuyer(userId: string) {
  return prisma.conversation.findUnique({ where: { userId } });
}

export async function listMessages(
  conversationId: string,
  options: { limit?: number } = {},
) {
  const limit = options.limit ?? DEFAULT_MESSAGE_LIMIT;
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  return messages.map(mapMessageDto);
}

async function enforceRateLimit(senderId: string) {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const recent = await prisma.message.count({
    where: {
      senderId,
      createdAt: { gte: since },
    },
  });

  if (recent >= RATE_LIMIT_MAX) {
    throw new ChatRateLimitError();
  }
}

type SendMessageInput = {
  senderId: string;
  senderRole: MessageSender;
  body: string;
  conversationId?: string;
  userId?: string;
  productContext?: ProductContext;
};

export async function sendMessage(input: SendMessageInput): Promise<MessageDto> {
  await enforceRateLimit(input.senderId);

  const conversation = await resolveConversationForSend(input);
  const preview = messagePreview(input.body);
  const now = new Date();

  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.message.create({
      data: {
        conversationId: conversation.id,
        senderId: input.senderId,
        senderRole: input.senderRole,
        body: input.body,
      },
    });

    await tx.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: now,
        lastMessagePreview: preview,
        lastMessageSender: input.senderRole,
        updatedAt: now,
      },
    });

    return created;
  });

  return mapMessageDto(message);
}

async function resolveConversationForSend(input: SendMessageInput) {
  if (input.conversationId) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: input.conversationId },
    });
    if (!conversation) {
      throw new ChatServiceError(
        CONVERSATION_NOT_FOUND,
        "Розмову не знайдено",
      );
    }
    return conversation;
  }

  if (!input.userId) {
    throw new ChatServiceError(
      CONVERSATION_NOT_FOUND,
      "Потрібен userId або conversationId",
    );
  }

  return getOrCreateConversation(input.userId, input.productContext);
}

export async function markAdminRead(conversationId: string) {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { adminLastReadAt: new Date() },
  });
}

export async function markBuyerRead(conversationId: string) {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { buyerLastReadAt: new Date() },
  });
}

export async function countUnreadForAdmin(): Promise<number> {
  return prisma.conversation.count({
    where: {
      lastMessageSender: "BUYER",
      lastMessageAt: { not: null },
      AND: [
        {
          lastMessageAt: {
            gt: prisma.conversation.fields.adminLastReadAt,
          },
        },
      ],
    },
  });
}

export async function listConversationsForAdmin(): Promise<
  ConversationSummaryDto[]
> {
  const conversations = await prisma.conversation.findMany({
    orderBy: { lastMessageAt: "desc" },
  });

  if (conversations.length === 0) return [];

  const users = await prisma.user.findMany({
    where: { id: { in: conversations.map((c) => c.userId) } },
    select: { id: true, name: true, email: true },
  });
  const userById = new Map(users.map((u) => [u.id, u]));

  return conversations.map((conversation) => {
    const buyer = userById.get(conversation.userId);
    const unreadForAdmin =
      conversation.lastMessageSender === "BUYER" &&
      conversation.lastMessageAt !== null &&
      conversation.lastMessageAt > conversation.adminLastReadAt;

    return {
      id: conversation.id,
      userId: conversation.userId,
      buyerName: buyer?.name ?? "Покупець",
      buyerEmail: buyer?.email ?? "",
      lastMessagePreview: conversation.lastMessagePreview,
      lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
      unreadForAdmin,
    };
  });
}

export function parseConversationChannel(channelName: string): string | null {
  const match = CONVERSATION_CHANNEL_RE.exec(channelName);
  return match?.[1] ?? null;
}

export async function assertConversationAccess(
  session: ChatSession,
  conversationId: string,
): Promise<void> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new ChatServiceError(CONVERSATION_NOT_FOUND, "Розмову не знайдено");
  }

  if (session.user.role === "admin") {
    return;
  }

  if (conversation.userId !== session.user.id) {
    throw new ChatServiceError(FORBIDDEN, "Немає доступу до цієї розмови");
  }
}
