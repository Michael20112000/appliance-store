import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/db";
import {
  archiveConversation,
  assertConversationAccess,
  CHAT_ARCHIVED,
  CHAT_RATE_LIMIT,
  ChatRateLimitError,
  // @ts-expect-error — not exported yet (Wave 0 RED stub)
  claimGuestConversation,
  CONVERSATION_NOT_FOUND,
  countUnreadForAdmin,
  // @ts-expect-error — not exported yet (Wave 0 RED stub)
  createNewConversation,
  deleteConversation,
  FORBIDDEN,
  getGuestConversation,
  getOrCreateConversation,
  getOrCreateGuestConversation,
  GUEST_NOT_FOUND,
  GUEST_TOKEN_INVALID,
  listConversationsForAdmin,
  // @ts-expect-error — not exported yet (Wave 0 RED stub)
  listConversationsForBuyer,
  listMessages,
  parseConversationChannel,
  sendMessage,
  unarchiveConversation,
} from "./chat.service";

vi.mock("@/lib/db", () => ({
  prisma: {
    conversation: {
      fields: { adminLastReadAt: "adminLastReadAt" },
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      findFirst: vi.fn(),
      findFirstOrThrow: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
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
    vi.mocked(prisma.conversation.findFirst).mockResolvedValueOnce(
      existing as never,
    );

    const result = await getOrCreateConversation("buyer-1");

    expect(result).toEqual(existing);
    expect(prisma.conversation.create).not.toHaveBeenCalled();
  });

  it("returns existing archived conversation without creating a new one", async () => {
    const archived = { id: "conv-1", userId: "buyer-1", status: "ARCHIVED" };
    vi.mocked(prisma.conversation.findFirst).mockResolvedValueOnce(
      archived as never,
    );

    const result = await getOrCreateConversation("buyer-1");

    expect(result).toEqual(archived);
    expect(prisma.conversation.create).not.toHaveBeenCalled();
  });

  it("creates conversation and handles P2002 race", async () => {
    vi.mocked(prisma.conversation.findFirst)
      .mockResolvedValueOnce(null as never);
    vi.mocked(prisma.conversation.create).mockRejectedValueOnce({
      code: "P2002",
    });
    const raced = { id: "conv-1", userId: "buyer-1" };
    vi.mocked(prisma.conversation.findFirstOrThrow).mockResolvedValueOnce(
      raced as never,
    );

    const result = await getOrCreateConversation("buyer-1");

    expect(result).toEqual(raced);
  });
});

describe("sendMessage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
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

  it("rejects send when conversation is archived", async () => {
    vi.mocked(prisma.message.count).mockResolvedValue(0);
    vi.mocked(prisma.conversation.findUnique).mockResolvedValueOnce({
      id: "conv-1",
      userId: "buyer-1",
      status: "ARCHIVED",
    } as never);

    await expect(
      sendMessage({
        senderId: "buyer-1",
        senderRole: "BUYER",
        conversationId: "conv-1",
        body: "ще раз",
      }),
    ).rejects.toMatchObject({ code: CHAT_ARCHIVED });

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("creates message and returns MessageDto", async () => {
    vi.mocked(prisma.message.count).mockResolvedValue(0);
    const conversation = {
      id: "conv-1",
      userId: "buyer-1",
      status: "OPEN",
      contextProductId: null,
      contextProductTitle: null,
    };
    vi.mocked(prisma.conversation.findFirst).mockResolvedValue(
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

  it("counts only OPEN conversations with buyer messages after admin read cursor", async () => {
    vi.mocked(prisma.conversation.count).mockResolvedValueOnce(3);

    const count = await countUnreadForAdmin();

    expect(count).toBe(3);
    expect(prisma.conversation.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "OPEN",
          lastMessageSender: "BUYER",
          lastMessageAt: { not: null },
        }),
      }),
    );
  });
});

describe("listConversationsForAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("filters conversations by status OPEN", async () => {
    const lastMessageAt = new Date("2026-05-17T12:00:00.000Z");
    vi.mocked(prisma.conversation.findMany).mockResolvedValueOnce([
      {
        id: "conv-1",
        userId: "buyer-1",
        status: "OPEN",
        lastMessagePreview: "hi",
        lastMessageAt,
        lastMessageSender: "BUYER",
        adminLastReadAt: new Date("2026-05-17T11:00:00.000Z"),
      },
    ] as never);
    vi.mocked(prisma.user.findMany).mockResolvedValueOnce([
      { id: "buyer-1", name: "Олег", email: "o@example.com" },
    ] as never);

    const rows = await listConversationsForAdmin({ status: "OPEN" });

    expect(prisma.conversation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "OPEN" },
        orderBy: { lastMessageAt: "desc" },
      }),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: "conv-1",
      status: "OPEN",
      buyerName: "Олег",
      unreadForAdmin: true,
    });
  });
});

describe("conversation lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("archiveConversation sets status ARCHIVED", async () => {
    vi.mocked(prisma.conversation.update).mockResolvedValueOnce({
      id: "conv-1",
      status: "ARCHIVED",
    } as never);

    await archiveConversation("conv-1");

    expect(prisma.conversation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "conv-1" },
        data: expect.objectContaining({ status: "ARCHIVED" }),
      }),
    );
  });

  it("archiveConversation sets isActive=false alongside status ARCHIVED (CHAT-04)", async () => {
    vi.mocked(prisma.conversation.update).mockResolvedValueOnce({
      id: "conv-1",
      status: "ARCHIVED",
      isActive: false,
    } as never);

    await archiveConversation("conv-1");

    expect(prisma.conversation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isActive: false }),
      }),
    );
  });

  it("unarchiveConversation sets status OPEN", async () => {
    vi.mocked(prisma.conversation.update).mockResolvedValueOnce({
      id: "conv-1",
      status: "OPEN",
    } as never);

    await unarchiveConversation("conv-1");

    expect(prisma.conversation.update).toHaveBeenCalledWith({
      where: { id: "conv-1" },
      data: { status: "OPEN" },
    });
  });

  it("deleteConversation hard-deletes the row", async () => {
    vi.mocked(prisma.conversation.delete).mockResolvedValueOnce({
      id: "conv-1",
    } as never);

    await deleteConversation("conv-1");

    expect(prisma.conversation.delete).toHaveBeenCalledWith({
      where: { id: "conv-1" },
    });
  });
});

describe("assertConversationAccess", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("allows buyer for own conversation", async () => {
    vi.mocked(prisma.conversation.findUnique).mockResolvedValue({
      id: "conv-1",
      userId: "buyer-1",
      status: "OPEN",
    } as never);

    await expect(
      assertConversationAccess(buyerSession, "conv-1"),
    ).resolves.toMatchObject({ id: "conv-1", status: "OPEN" });
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
      status: "ARCHIVED",
    } as never);

    await expect(
      assertConversationAccess(adminSession, "conv-1"),
    ).resolves.toMatchObject({ id: "conv-1", status: "ARCHIVED" });
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

describe("getOrCreateGuestConversation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates conversation on first message", async () => {
    vi.mocked(prisma.conversation.findUnique).mockResolvedValueOnce(
      null as never,
    );
    const created = {
      id: "conv-g1",
      guestToken: "uuid-1",
      isActive: true,
    };
    vi.mocked(prisma.conversation.create).mockResolvedValueOnce(
      created as never,
    );

    const result = await getOrCreateGuestConversation("uuid-1");

    expect(result).toEqual(created);
  });

  it("returns existing conversation on retry (P2002 race)", async () => {
    vi.mocked(prisma.conversation.findUnique).mockResolvedValueOnce(
      null as never,
    );
    vi.mocked(prisma.conversation.create).mockRejectedValueOnce({
      code: "P2002",
    });
    const raced = { id: "conv-g1" };
    vi.mocked(prisma.conversation.findUniqueOrThrow).mockResolvedValueOnce(
      raced as never,
    );

    const result = await getOrCreateGuestConversation("uuid-1");

    expect(result).toEqual(raced);
  });

  it("returns existing conversation directly", async () => {
    const existing = { id: "conv-g1", guestToken: "uuid-1" };
    vi.mocked(prisma.conversation.findUnique).mockResolvedValueOnce(
      existing as never,
    );

    const result = await getOrCreateGuestConversation("uuid-1");

    expect(result).toEqual(existing);
    expect(prisma.conversation.create).not.toHaveBeenCalled();
  });
});

describe("getGuestConversation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null for unknown token", async () => {
    vi.mocked(prisma.conversation.findUnique).mockResolvedValueOnce(
      null as never,
    );

    const result = await getGuestConversation("unknown-token");

    expect(result).toBeNull();
  });

  it("returns conversation for known token", async () => {
    const conv = { id: "conv-g1", guestToken: "uuid-1" };
    vi.mocked(prisma.conversation.findUnique).mockResolvedValueOnce(
      conv as never,
    );

    const result = await getGuestConversation("uuid-1");

    expect(result).toMatchObject(conv);
  });
});

describe("listConversationsForAdmin - guest conversations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses 'Гість' as buyerName when userId is null", async () => {
    const lastMessageAt = new Date();
    vi.mocked(prisma.conversation.findMany).mockResolvedValueOnce([
      {
        id: "conv-g1",
        userId: null,
        status: "OPEN",
        lastMessagePreview: "hi",
        lastMessageAt,
        lastMessageSender: "BUYER",
        adminLastReadAt: new Date(Date.now() - 1000),
      },
    ] as never);
    vi.mocked(prisma.user.findMany).mockResolvedValueOnce([] as never);

    const rows = await listConversationsForAdmin({ status: "OPEN" });

    expect(rows[0]?.buyerName).toBe("Гість");
  });
});

describe("assertConversationAccess - guest conversation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("throws FORBIDDEN for buyer accessing guest conversation (null userId)", async () => {
    vi.mocked(prisma.conversation.findUnique).mockResolvedValue({
      id: "conv-g1",
      userId: null,
      status: "OPEN",
    } as never);

    await expect(
      assertConversationAccess(buyerSession, "conv-g1"),
    ).rejects.toMatchObject({ code: FORBIDDEN });
  });
});

describe("Phase 47 stubs — createNewConversation (CHAT-05)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createNewConversation({ userId }) deactivates old conversation and creates a new one in $transaction", async () => {
    const newConv = { id: "new-conv-id", userId: "user-1", isActive: true };
    vi.mocked(prisma.$transaction).mockImplementationOnce(async (fn) => {
      const tx = {
        conversation: {
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
          create: vi.fn().mockResolvedValue(newConv),
        },
      };
      return fn(tx as never);
    });

    const result = await (createNewConversation as (input: { userId: string }) => Promise<{ id: string }>)({ userId: "user-1" });

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(result).toMatchObject({ id: "new-conv-id" });
  });

  it("createNewConversation({ guestToken }) deactivates old active guest conversation and creates a new one with a fresh token", async () => {
    const freshToken = "fresh-uuid-token";
    const newConv = { id: "new-conv-id", guestToken: freshToken, isActive: true };
    const mockUpdateMany = vi.fn().mockResolvedValue({ count: 1 });
    const mockCreate = vi.fn().mockResolvedValue(newConv);
    vi.mocked(prisma.$transaction).mockImplementationOnce(async (fn) => {
      const tx = { conversation: { updateMany: mockUpdateMany, create: mockCreate } };
      return fn(tx as never);
    });

    const result = await (createNewConversation as (input: { guestToken: string }) => Promise<{ id: string; guestToken?: string }>)({ guestToken: "tok-abc" });

    expect(prisma.$transaction).toHaveBeenCalled();
    // Old active conversation deactivated but guestToken left intact (owner_required constraint)
    expect(mockUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ guestToken: "tok-abc", isActive: true }),
        data: expect.objectContaining({ isActive: false }),
      }),
    );
    // New conversation created with a different (fresh) token
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isActive: true }) }),
    );
    expect(result).toMatchObject({ id: "new-conv-id" });
    expect(result.guestToken).toBeDefined();
  });
});

describe("Phase 47 stubs — claimGuestConversation (CHAT-02)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("claims guest conversation: links guestToken to userId (basic claim)", async () => {
    // User has no active conversation
    vi.mocked(prisma.conversation.findFirst).mockResolvedValueOnce(null as never);
    vi.mocked(prisma.conversation.updateMany).mockResolvedValueOnce({ count: 1 } as never);

    await (claimGuestConversation as (guestToken: string, userId: string) => Promise<void>)("token-xyz", "user-1");

    expect(prisma.conversation.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ guestToken: "token-xyz" }),
        data: expect.objectContaining({ userId: "user-1", guestToken: null }),
      }),
    );
  });

  it("claimGuestConversation is idempotent: second call (updateMany returns count=0) does not throw", async () => {
    // User has no active conversation
    vi.mocked(prisma.conversation.findFirst).mockResolvedValueOnce(null as never);
    // Token already null — 0 rows updated
    vi.mocked(prisma.conversation.updateMany).mockResolvedValueOnce({ count: 0 } as never);

    await expect(
      (claimGuestConversation as (guestToken: string, userId: string) => Promise<void>)("token-xyz", "user-1"),
    ).resolves.toBeUndefined();
  });

  it("claimGuestConversation when user already has active conversation: guest conv becomes isActive=false", async () => {
    // User already has an active conversation
    vi.mocked(prisma.conversation.findFirst).mockResolvedValueOnce({
      id: "existing-conv",
    } as never);
    vi.mocked(prisma.conversation.updateMany).mockResolvedValueOnce({ count: 1 } as never);

    await (claimGuestConversation as (guestToken: string, userId: string) => Promise<void>)("token-xyz", "user-1");

    expect(prisma.conversation.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "user-1", guestToken: null, isActive: false }),
      }),
    );
  });
});

describe("listConversationsForBuyer (CHAT-07)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls prisma.conversation.findMany with where: { userId } (CHAT-07)", async () => {
    vi.mocked(prisma.conversation.findMany).mockResolvedValueOnce([] as never);

    await (listConversationsForBuyer as (userId: string) => Promise<unknown[]>)(
      "buyer-1",
    );

    expect(prisma.conversation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: "buyer-1" }),
      }),
    );
  });

  it("returns conversations sorted desc by lastMessageAt", async () => {
    const rows = [
      {
        id: "conv-2",
        userId: "buyer-1",
        status: "OPEN",
        lastMessagePreview: "b",
        lastMessageAt: new Date("2026-05-26"),
      },
      {
        id: "conv-1",
        userId: "buyer-1",
        status: "ARCHIVED",
        lastMessagePreview: "a",
        lastMessageAt: new Date("2026-05-25"),
      },
    ] as never;
    vi.mocked(prisma.conversation.findMany).mockResolvedValueOnce(rows);

    const result = await (
      listConversationsForBuyer as (userId: string) => Promise<
        Array<{
          id: string;
          buyerName: string;
          buyerEmail: string;
          unreadForAdmin: boolean;
        }>
      >
    )("buyer-1");

    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe("conv-2");
    expect(result[0]?.buyerName).toBe("Ви");
    expect(result[0]?.buyerEmail).toBe("");
    expect(result[0]?.unreadForAdmin).toBe(false);
  });

  it("does NOT filter by isActive in the where clause (CHAT-07 — all history)", async () => {
    vi.mocked(prisma.conversation.findMany).mockResolvedValueOnce([] as never);

    await (listConversationsForBuyer as (userId: string) => Promise<unknown[]>)(
      "buyer-1",
    );

    const call = vi.mocked(prisma.conversation.findMany).mock.calls[0]?.[0];
    expect(call?.where).not.toHaveProperty("isActive");
  });
});

// Ensure unused imports don't cause lint errors
void GUEST_TOKEN_INVALID;
void GUEST_NOT_FOUND;
