import type {
  ConversationStatus,
  MessageSender,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type {
  ConversationSummaryDto,
  MessageDto,
} from "@/types/chat";

export const CONVERSATION_NOT_FOUND = "CONVERSATION_NOT_FOUND";
export const FORBIDDEN = "FORBIDDEN";
export const CHAT_RATE_LIMIT = "CHAT_RATE_LIMIT";
export const CHAT_ARCHIVED = "CHAT_ARCHIVED";
export const GUEST_TOKEN_INVALID = "GUEST_TOKEN_INVALID";
export const GUEST_NOT_FOUND = "GUEST_NOT_FOUND";

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
  const existing = await prisma.conversation.findFirst({
    where: { userId, isActive: true },
  });
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
      return prisma.conversation.findFirstOrThrow({
        where: { userId, isActive: true },
      });
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
  return prisma.conversation.findFirst({ where: { userId, isActive: true } });
}

export async function getGuestConversation(guestToken: string) {
  return prisma.conversation.findUnique({ where: { guestToken } });
}

export async function getOrCreateGuestConversation(
  guestToken: string,
  context?: ProductContext,
) {
  const existing = await prisma.conversation.findUnique({
    where: { guestToken },
  });
  if (existing) return existing;

  try {
    return await prisma.conversation.create({
      data: {
        guestToken,
        isActive: true,
        contextProductId: context?.productId,
        contextProductTitle: context?.productTitle,
      },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return prisma.conversation.findUniqueOrThrow({ where: { guestToken } });
    }
    throw error;
  }
}

export async function listMessages(
  conversationId: string,
  options: { limit?: number } = {},
) {
  const limit = options.limit ?? DEFAULT_MESSAGE_LIMIT;
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return messages.reverse().map(mapMessageDto);
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
  guestToken?: string;
};

function assertConversationOpen(conversation: { status: ConversationStatus }) {
  if (conversation.status === "ARCHIVED") {
    throw new ChatServiceError(
      CHAT_ARCHIVED,
      "Діалог закрито магазином. Написати більше не можна.",
    );
  }
}

export async function sendMessage(input: SendMessageInput): Promise<MessageDto> {
  await enforceRateLimit(input.senderId);

  const conversation = await resolveConversationForSend(input);
  assertConversationOpen(conversation);
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

  if (input.guestToken) {
    return getOrCreateGuestConversation(input.guestToken, input.productContext);
  }

  if (!input.userId) {
    throw new ChatServiceError(
      CONVERSATION_NOT_FOUND,
      "Потрібен userId, guestToken або conversationId",
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
      status: "OPEN",
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

export async function archiveConversation(conversationId: string) {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { status: "ARCHIVED", isActive: false },
  });
}

export async function createNewConversation(
  input: { userId: string } | { guestToken: string },
): Promise<{ id: string; guestToken?: string }> {
  return prisma.$transaction(async (tx) => {
    if ("userId" in input) {
      await tx.conversation.updateMany({
        where: { userId: input.userId, isActive: true },
        data: { isActive: false },
      });
      return tx.conversation.create({
        data: { userId: input.userId, isActive: true },
      });
    } else {
      // Deactivate the old active conversation without touching its guestToken —
      // clearing guestToken would violate the owner_required check constraint
      // (archived guest row would have neither userId nor guestToken).
      await tx.conversation.updateMany({
        where: { guestToken: input.guestToken, isActive: true },
        data: { isActive: false },
      });
      const { randomUUID } = await import("crypto");
      const newToken = randomUUID();
      const conv = await tx.conversation.create({
        data: { guestToken: newToken, isActive: true },
      });
      return { id: conv.id, guestToken: newToken };
    }
  });
}

export async function claimGuestConversation(
  guestToken: string,
  userId: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existingActive = await tx.conversation.findFirst({
      where: { userId, isActive: true },
    });

    if (existingActive) {
      await tx.conversation.updateMany({
        where: { guestToken },
        data: { userId, guestToken: null, isActive: false },
      });
    } else {
      await tx.conversation.updateMany({
        where: { guestToken },
        data: { userId, guestToken: null },
      });
    }
  });
}

export async function unarchiveConversation(conversationId: string) {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { status: "OPEN", isActive: true },
  });
}

export async function deleteConversation(conversationId: string) {
  await prisma.conversation.delete({
    where: { id: conversationId },
  });
}

export async function listConversationsForAdmin(options: {
  status: ConversationStatus;
}): Promise<ConversationSummaryDto[]> {
  const conversations = await prisma.conversation.findMany({
    where: { status: options.status },
    orderBy: { lastMessageAt: "desc" },
  });

  if (conversations.length === 0) return [];

  const userIds = conversations
    .map((c) => c.userId)
    .filter((id): id is string => id !== null);

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  });
  const userById = new Map(users.map((u) => [u.id, u]));

  return conversations.map((conversation) => {
    const buyer = conversation.userId
      ? userById.get(conversation.userId)
      : null;
    const unreadForAdmin =
      conversation.lastMessageSender === "BUYER" &&
      conversation.lastMessageAt !== null &&
      conversation.lastMessageAt > conversation.adminLastReadAt;

    return {
      id: conversation.id,
      userId: conversation.userId,
      status: conversation.status,
      buyerName: buyer?.name ?? "Гість",
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
): Promise<{ id: string; userId: string | null; status: ConversationStatus }> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new ChatServiceError(CONVERSATION_NOT_FOUND, "Розмову не знайдено");
  }

  if (session.user.role === "admin") {
    return conversation;
  }

  if (!conversation.userId || conversation.userId !== session.user.id) {
    throw new ChatServiceError(FORBIDDEN, "Немає доступу до цієї розмови");
  }

  return conversation;
}
