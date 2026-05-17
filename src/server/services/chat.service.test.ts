import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/db";
import {
  assertConversationAccess,
  CHAT_RATE_LIMIT,
  ChatRateLimitError,
  CONVERSATION_NOT_FOUND,
  countUnreadForAdmin,
  FORBIDDEN,
  getOrCreateConversation,
  listMessages,
  parseConversationChannel,
  sendMessage,
} from "./chat.service";

vi.mock("@/lib/db", () => ({
  prisma: {
    conversation: {
      fields: { adminLastReadAt: "adminLastReadAt" },
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    message: {
      create: vi.fn(),
      count: vi.fn(),
      findMany: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

const buyerSession = {
  user: { id: "buyer-1", role: "buyer" },
};

const adminSession = {
  user: { id: "admin-1", role: "admin" },
};

describe("getOrCreateConversation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns existing conversation", async () => {
    const existing = { id: "conv-1", userId: "buyer-1" };
    vi.mocked(prisma.conversation.findUnique).mockResolvedValueOnce(
      existing as never,
    );

    const result = await getOrCreateConversation("buyer-1");

    expect(result).toEqual(existing);
    expect(prisma.conversation.create).not.toHaveBeenCalled();
  });

  it("creates conversation and handles P2002 race", async () => {
    vi.mocked(prisma.conversation.findUnique)
      .mockResolvedValueOnce(null as never)
      .mockResolvedValueOnce(null as never);
    vi.mocked(prisma.conversation.create).mockRejectedValueOnce({
      code: "P2002",
    });
    const raced = { id: "conv-1", userId: "buyer-1" };
    vi.mocked(prisma.conversation.findUniqueOrThrow).mockResolvedValueOnce(
      raced as never,
    );

    const result = await getOrCreateConversation("buyer-1");

    expect(result).toEqual(raced);
  });
});

describe("sendMessage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(prisma.conversation).fields = {
      adminLastReadAt: "adminLastReadAt",
    };
  });

  it("rejects when rate limit exceeded at 20 messages in window", async () => {
    vi.mocked(prisma.message.count).mockResolvedValueOnce(20);

    await expect(
      sendMessage({
        senderId: "buyer-1",
        senderRole: "BUYER",
        userId: "buyer-1",
        body: "ще одне",
      }),
    ).rejects.toMatchObject({ code: CHAT_RATE_LIMIT });

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("rejects 21st message in the same window", async () => {
    vi.mocked(prisma.message.count).mockResolvedValueOnce(21);

    await expect(
      sendMessage({
        senderId: "buyer-1",
        senderRole: "BUYER",
        userId: "buyer-1",
        body: "зайве",
      }),
    ).rejects.toBeInstanceOf(ChatRateLimitError);
  });

  it("creates message and returns MessageDto", async () => {
    vi.mocked(prisma.message.count).mockResolvedValue(0);
    const conversation = {
      id: "conv-1",
      userId: "buyer-1",
      contextProductId: null,
      contextProductTitle: null,
    };
    vi.mocked(prisma.conversation.findUnique).mockResolvedValue(
      conversation as never,
    );

    const createdAt = new Date("2026-05-17T12:00:00.000Z");
    const message = {
      id: "msg-1",
      conversationId: "conv-1",
      senderId: "buyer-1",
      senderRole: "BUYER" as const,
      body: "Привіт",
      createdAt,
    };

    vi.mocked(prisma.$transaction).mockImplementationOnce(async (fn) => {
      const tx = {
        message: { create: vi.fn().mockResolvedValue(message) },
        conversation: { update: vi.fn().mockResolvedValue({}) },
      };
      return fn(tx as never);
    });

    const dto = await sendMessage({
      senderId: "buyer-1",
      senderRole: "BUYER",
      userId: "buyer-1",
      body: "Привіт",
    });

    expect(dto).toEqual({
      id: "msg-1",
      conversationId: "conv-1",
      body: "Привіт",
      senderRole: "BUYER",
      senderId: "buyer-1",
      createdAt: createdAt.toISOString(),
    });
  });
});

describe("listMessages", () => {
  it("returns messages ordered asc with default limit 50", async () => {
    const createdAt = new Date("2026-05-17T12:00:00.000Z");
    vi.mocked(prisma.message.findMany).mockResolvedValueOnce([
      {
        id: "msg-1",
        conversationId: "conv-1",
        senderId: "buyer-1",
        senderRole: "BUYER",
        body: "a",
        createdAt,
      },
    ] as never);

    const messages = await listMessages("conv-1");

    expect(prisma.message.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { conversationId: "conv-1" },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    );
    expect(messages[0]?.body).toBe("a");
  });
});

describe("countUnreadForAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("counts conversations with buyer messages after admin read cursor", async () => {
    vi.mocked(prisma.conversation.count).mockResolvedValueOnce(3);

    const count = await countUnreadForAdmin();

    expect(count).toBe(3);
    expect(prisma.conversation.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          lastMessageSender: "BUYER",
          lastMessageAt: { not: null },
        }),
      }),
    );
  });
});

describe("assertConversationAccess", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(prisma.conversation).fields = {
      adminLastReadAt: "adminLastReadAt",
    };
  });

  it("allows buyer for own conversation", async () => {
    vi.mocked(prisma.conversation.findUnique).mockResolvedValue({
      id: "conv-1",
      userId: "buyer-1",
    } as never);

    await expect(
      assertConversationAccess(buyerSession, "conv-1"),
    ).resolves.toBeUndefined();
  });

  it("throws FORBIDDEN when buyer accesses another thread", async () => {
    vi.mocked(prisma.conversation.findUnique).mockResolvedValue({
      id: "conv-1",
      userId: "other-buyer",
    } as never);

    await expect(
      assertConversationAccess(buyerSession, "conv-1"),
    ).rejects.toMatchObject({ code: FORBIDDEN });
  });

  it("allows admin for any conversation", async () => {
    vi.mocked(prisma.conversation.findUnique).mockResolvedValue({
      id: "conv-1",
      userId: "buyer-1",
    } as never);

    await expect(
      assertConversationAccess(adminSession, "conv-1"),
    ).resolves.toBeUndefined();
  });

  it("throws CONVERSATION_NOT_FOUND when missing", async () => {
    vi.mocked(prisma.conversation.findUnique).mockResolvedValue(null);

    await expect(
      assertConversationAccess(buyerSession, "conv-missing"),
    ).rejects.toMatchObject({ code: CONVERSATION_NOT_FOUND });
  });
});

describe("parseConversationChannel", () => {
  it("parses valid private conversation channel", () => {
    const conversationId = "clh3vjq8e0000qz3e8q8q8q8q";
    expect(
      parseConversationChannel(`private-conversation-${conversationId}`),
    ).toBe(conversationId);
  });

  it("returns null for invalid channel", () => {
    expect(parseConversationChannel("presence-foo")).toBeNull();
  });
});

describe("ChatRateLimitError", () => {
  it("exposes CHAT_RATE_LIMIT code", () => {
    const err = new ChatRateLimitError();
    expect(err.code).toBe(CHAT_RATE_LIMIT);
  });
});
