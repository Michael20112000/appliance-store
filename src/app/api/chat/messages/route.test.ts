import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ChatRateLimitError,
  ChatServiceError,
  CHAT_ARCHIVED,
  CONVERSATION_NOT_FOUND,
  FORBIDDEN,
} from "@/server/services/chat.service";
import { PusherNotConfiguredError } from "@/lib/pusher-server";
import { POST, GET } from "./route";

const getSession = vi.fn();
const sendMessage = vi.fn();
const listMessages = vi.fn();
const assertConversationAccess = vi.fn();
const trigger = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => getSession(...args),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("@/server/services/chat.service", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/server/services/chat.service")>();
  return {
    ...actual,
    sendMessage: (...args: unknown[]) => sendMessage(...args),
    listMessages: (...args: unknown[]) => listMessages(...args),
    assertConversationAccess: (...args: unknown[]) =>
      assertConversationAccess(...args),
  };
});

const getPusherServer = vi.fn();

vi.mock("@/lib/pusher-server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/pusher-server")>();
  return {
    ...actual,
    getPusherServer: () => getPusherServer(),
    conversationChannel: (id: string) => `private-conversation-${id}`,
  };
});

const CONV_ID = "cltestconv00000000000001";

const messageDto = {
  id: "cltestmsg0000000000000001",
  conversationId: CONV_ID,
  body: "Привіт",
  senderRole: "BUYER" as const,
  senderId: "buyer-1",
  createdAt: "2026-05-17T12:00:00.000Z",
  attachments: undefined,
};

const attachment = {
  publicId: "chat/abc123",
  resourceType: "image" as const,
  url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  filename: "sample.jpg",
  bytes: 1024,
};

const messageDtoWithAttachment = {
  id: "cltestmsg0000000000000002",
  conversationId: CONV_ID,
  body: "",
  senderRole: "BUYER" as const,
  senderId: "buyer-1",
  createdAt: "2026-05-17T12:00:00.000Z",
  attachments: [attachment],
};

function postMessages(body: unknown) {
  return POST(
    new Request("http://localhost/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

function getMessages(conversationId: string) {
  return GET(
    new Request(
      `http://localhost/api/chat/messages?conversationId=${conversationId}`,
    ),
  );
}

describe("POST /api/chat/messages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendMessage.mockResolvedValue(messageDto);
    getPusherServer.mockReturnValue({ trigger });
    trigger.mockResolvedValue(undefined);
    assertConversationAccess.mockResolvedValue(undefined);
    listMessages.mockResolvedValue([messageDto]);
  });

  it("returns 401 for guest", async () => {
    getSession.mockResolvedValue(null);

    const res = await postMessages({ body: "Hi" });

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "UNAUTHORIZED" });
    expect(sendMessage).not.toHaveBeenCalled();
    expect(trigger).not.toHaveBeenCalled();
  });

  it("returns 201 and triggers Pusher once for buyer", async () => {
    getSession.mockResolvedValue({
      user: { id: "buyer-1", role: "buyer" },
    });

    const res = await postMessages({ body: "Привіт", productId: undefined });

    expect(res.status).toBe(201);
    await expect(res.json()).resolves.toEqual(messageDto);
    expect(sendMessage).toHaveBeenCalledWith({
      userId: "buyer-1",
      senderRole: "BUYER",
      senderId: "buyer-1",
      body: "Привіт",
      productContext: undefined,
    });
    expect(trigger).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveBeenCalledWith(
      `private-conversation-${CONV_ID}`,
      "message:new",
      {
        id: messageDto.id,
        conversationId: messageDto.conversationId,
        body: messageDto.body,
        senderRole: messageDto.senderRole,
        createdAt: messageDto.createdAt,
        attachments: messageDto.attachments,
      },
    );
  });

  it("returns 201 for admin with STORE sender role", async () => {
    getSession.mockResolvedValue({
      user: { id: "admin-1", role: "admin" },
    });
    const storeMessage = {
      ...messageDto,
      senderRole: "STORE" as const,
      senderId: "admin-1",
    };
    sendMessage.mockResolvedValue(storeMessage);

    const res = await postMessages({
      body: "Відповідь магазину",
      conversationId: CONV_ID,
    });

    expect(res.status).toBe(201);
    expect(sendMessage).toHaveBeenCalledWith({
      conversationId: CONV_ID,
      senderRole: "STORE",
      senderId: "admin-1",
      body: "Відповідь магазину",
    });
    expect(trigger).toHaveBeenCalledTimes(1);
  });

  it("returns 400 when admin omits conversationId", async () => {
    getSession.mockResolvedValue({
      user: { id: "admin-1", role: "admin" },
    });

    const res = await postMessages({ body: "Hi" });

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      error: "CONVERSATION_ID_REQUIRED",
    });
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("returns 429 on rate limit", async () => {
    getSession.mockResolvedValue({
      user: { id: "buyer-1", role: "buyer" },
    });
    sendMessage.mockRejectedValue(new ChatRateLimitError());

    const res = await postMessages({ body: "Спам" });

    expect(res.status).toBe(429);
    await expect(res.json()).resolves.toEqual({
      error: "CHAT_RATE_LIMIT",
      message: "Забагато повідомлень. Спробуйте за хвилину.",
    });
    expect(trigger).not.toHaveBeenCalled();
  });

  it("returns 403 when sendMessage throws CHAT_ARCHIVED", async () => {
    getSession.mockResolvedValue({
      user: { id: "buyer-1", role: "buyer" },
    });
    sendMessage.mockRejectedValue(
      new ChatServiceError(
        CHAT_ARCHIVED,
        "Діалог закрито магазином. Написати більше не можна.",
      ),
    );

    const res = await postMessages({ body: "Hi", conversationId: CONV_ID });

    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toEqual({
      error: CHAT_ARCHIVED,
      message: "Діалог закрито магазином. Написати більше не можна.",
    });
    expect(trigger).not.toHaveBeenCalled();
  });

  it("does not trigger Pusher when sendMessage throws", async () => {
    getSession.mockResolvedValue({
      user: { id: "buyer-1", role: "buyer" },
    });
    sendMessage.mockRejectedValue(
      new ChatServiceError(FORBIDDEN, "Немає доступу"),
    );

    const res = await postMessages({ body: "Hi" });

    expect(res.status).toBe(403);
    expect(trigger).not.toHaveBeenCalled();
  });

  it("POST with attachment included — buyer path persists attachment in response", async () => {
    getSession.mockResolvedValue({
      user: { id: "buyer-1", role: "buyer" },
    });
    sendMessage.mockResolvedValue(messageDtoWithAttachment);

    const res = await postMessages({
      body: "",
      attachments: [attachment],
    });

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.attachments).toEqual([attachment]);
    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ attachments: [attachment] }),
    );
  });

  it("POST with body='' and no attachments — buyer path returns 400 VALIDATION_ERROR", async () => {
    getSession.mockResolvedValue({
      user: { id: "buyer-1", role: "buyer" },
    });

    const res = await postMessages({ body: "" });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("VALIDATION_ERROR");
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("returns 201 when Pusher is not configured but message was saved", async () => {
    getSession.mockResolvedValue({
      user: { id: "buyer-1", role: "buyer" },
    });
    getPusherServer.mockImplementation(() => {
      throw new PusherNotConfiguredError();
    });

    const res = await postMessages({ body: "Hi" });

    expect(res.status).toBe(201);
    await expect(res.json()).resolves.toEqual(messageDto);
    expect(sendMessage).toHaveBeenCalled();
    expect(trigger).not.toHaveBeenCalled();
  });
});

describe("GET /api/chat/messages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    assertConversationAccess.mockResolvedValue({
      id: CONV_ID,
      userId: "buyer-1",
      status: "OPEN",
    });
    listMessages.mockResolvedValue([messageDto]);
  });

  it("returns 401 for guest", async () => {
    getSession.mockResolvedValue(null);

    const res = await getMessages(CONV_ID);

    expect(res.status).toBe(401);
    expect(listMessages).not.toHaveBeenCalled();
  });

  it("returns messages for authorized participant", async () => {
    getSession.mockResolvedValue({
      user: { id: "buyer-1", role: "buyer" },
    });

    const res = await getMessages(CONV_ID);

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      messages: [messageDto],
      status: "OPEN",
    });
    expect(assertConversationAccess).toHaveBeenCalledWith(
      { user: { id: "buyer-1", role: "buyer" } },
      CONV_ID,
    );
    expect(listMessages).toHaveBeenCalledWith(CONV_ID, { limit: 50 });
  });

  it("returns 403 when access denied", async () => {
    getSession.mockResolvedValue({
      user: { id: "buyer-2", role: "buyer" },
    });
    assertConversationAccess.mockRejectedValue(
      new ChatServiceError(FORBIDDEN, "Немає доступу"),
    );

    const res = await getMessages(CONV_ID);

    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toEqual({ error: FORBIDDEN });
  });

  it("returns 404 when conversation not found", async () => {
    getSession.mockResolvedValue({
      user: { id: "buyer-1", role: "buyer" },
    });
    assertConversationAccess.mockRejectedValue(
      new ChatServiceError(CONVERSATION_NOT_FOUND, "Розмову не знайдено"),
    );

    const res = await getMessages(CONV_ID);

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({
      error: CONVERSATION_NOT_FOUND,
    });
  });

  it("GET /api/chat/messages includes attachments in message list", async () => {
    getSession.mockResolvedValue({
      user: { id: "buyer-1", role: "buyer" },
    });
    listMessages.mockResolvedValue([messageDtoWithAttachment]);

    const res = await getMessages(CONV_ID);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.messages).toEqual([messageDtoWithAttachment]);
    expect(json.messages[0].attachments).toEqual([attachment]);
  });
});
