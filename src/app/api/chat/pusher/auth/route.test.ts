import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ChatServiceError,
  CONVERSATION_NOT_FOUND,
  FORBIDDEN,
} from "@/server/services/chat.service";
import { PusherNotConfiguredError } from "@/lib/pusher-server";
import { POST } from "./route";

const getSession = vi.fn();
const assertConversationAccess = vi.fn();
const parseConversationChannel = vi.fn();
const authorizeChannel = vi.fn();

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
    assertConversationAccess: (...args: unknown[]) =>
      assertConversationAccess(...args),
    parseConversationChannel: (...args: unknown[]) =>
      parseConversationChannel(...args),
  };
});

const getPusherServer = vi.fn();

vi.mock("@/lib/pusher-server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/pusher-server")>();
  return {
    ...actual,
    getPusherServer: () => getPusherServer(),
  };
});

const CONV_ID = "cltestconv00000000000001";
const CHANNEL = `private-conversation-${CONV_ID}`;

function postAuth(
  body: Record<string, string>,
  contentType = "application/json",
) {
  const init: RequestInit = {
    method: "POST",
    headers: { "Content-Type": contentType },
  };
  if (contentType === "application/json") {
    init.body = JSON.stringify(body);
  } else {
    init.body = new URLSearchParams(body).toString();
  }
  return POST(new Request("http://localhost/api/chat/pusher/auth", init));
}

describe("POST /api/chat/pusher/auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    parseConversationChannel.mockImplementation((name: string) =>
      name === CHANNEL ? CONV_ID : null,
    );
    authorizeChannel.mockReturnValue({
      auth: "key:signature",
    });
    getPusherServer.mockReturnValue({
      authorizeChannel: (...args: unknown[]) => authorizeChannel(...args),
    });
    assertConversationAccess.mockResolvedValue(undefined);
  });

  it("returns 401 when unauthenticated", async () => {
    getSession.mockResolvedValue(null);

    const res = await postAuth({
      socket_id: "123.456",
      channel_name: CHANNEL,
    });

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "UNAUTHORIZED" });
    expect(assertConversationAccess).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed channel_name", async () => {
    getSession.mockResolvedValue({
      user: { id: "buyer-1", role: "buyer" },
    });
    parseConversationChannel.mockReturnValue(null);

    const res = await postAuth({
      socket_id: "123.456",
      channel_name: "invalid-channel",
    });

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "INVALID_CHANNEL" });
    expect(assertConversationAccess).not.toHaveBeenCalled();
  });

  it("returns 403 when buyer cannot access conversation", async () => {
    getSession.mockResolvedValue({
      user: { id: "buyer-1", role: "buyer" },
    });
    assertConversationAccess.mockRejectedValue(
      new ChatServiceError(FORBIDDEN, "Немає доступу до цієї розмови"),
    );

    const res = await postAuth({
      socket_id: "123.456",
      channel_name: CHANNEL,
    });

    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toEqual({ error: FORBIDDEN });
    expect(authorizeChannel).not.toHaveBeenCalled();
  });

  it("returns 200 with auth JSON for admin on any conversation", async () => {
    getSession.mockResolvedValue({
      user: { id: "admin-1", role: "admin" },
    });

    const res = await postAuth({
      socket_id: "123.456",
      channel_name: CHANNEL,
    });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ auth: "key:signature" });
    expect(assertConversationAccess).toHaveBeenCalledWith(
      { user: { id: "admin-1", role: "admin" } },
      CONV_ID,
    );
    expect(authorizeChannel).toHaveBeenCalledWith("123.456", CHANNEL);
  });

  it("returns 200 with auth JSON for buyer on own conversation", async () => {
    getSession.mockResolvedValue({
      user: { id: "buyer-1", role: "buyer" },
    });

    const res = await postAuth({
      socket_id: "99.88",
      channel_name: CHANNEL,
    });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ auth: "key:signature" });
    expect(assertConversationAccess).toHaveBeenCalledWith(
      { user: { id: "buyer-1", role: "buyer" } },
      CONV_ID,
    );
  });

  it("parses application/x-www-form-urlencoded body", async () => {
    getSession.mockResolvedValue({
      user: { id: "buyer-1", role: "buyer" },
    });

    const res = await postAuth(
      { socket_id: "1.2", channel_name: CHANNEL },
      "application/x-www-form-urlencoded",
    );

    expect(res.status).toBe(200);
    expect(authorizeChannel).toHaveBeenCalledWith("1.2", CHANNEL);
  });

  it("returns 404 when conversation does not exist", async () => {
    getSession.mockResolvedValue({
      user: { id: "admin-1", role: "admin" },
    });
    assertConversationAccess.mockRejectedValue(
      new ChatServiceError(CONVERSATION_NOT_FOUND, "Розмову не знайдено"),
    );

    const res = await postAuth({
      socket_id: "123.456",
      channel_name: CHANNEL,
    });

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({
      error: CONVERSATION_NOT_FOUND,
    });
  });

  it("returns 503 when Pusher is not configured", async () => {
    getSession.mockResolvedValue({
      user: { id: "buyer-1", role: "buyer" },
    });
    getPusherServer.mockImplementation(() => {
      throw new PusherNotConfiguredError();
    });

    const res = await postAuth({
      socket_id: "123.456",
      channel_name: CHANNEL,
    });

    expect(res.status).toBe(503);
    await expect(res.json()).resolves.toEqual({
      error: "PUSHER_NOT_CONFIGURED",
    });
  });
});
