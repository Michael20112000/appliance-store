import { beforeEach, describe, expect, it, vi } from "vitest";

const getSession = vi.fn();
const listConversationsForBuyer = vi.fn();

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => getSession(...args),
    },
  },
}));

vi.mock("@/server/services/chat.service", () => ({
  listConversationsForBuyer: (...args: unknown[]) =>
    listConversationsForBuyer(...args),
}));

import { GET } from "@/app/api/chat/conversations/route";

describe("GET /api/chat/conversations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when no session (CHAT-07 auth guard)", async () => {
    getSession.mockResolvedValueOnce(null);

    const response = await GET();

    expect(response.status).toBe(401);
  });

  it("returns 200 with conversations array for authenticated user (CHAT-07)", async () => {
    getSession.mockResolvedValueOnce({ user: { id: "buyer-1" } });
    listConversationsForBuyer.mockResolvedValueOnce([
      { id: "conv-1", buyerName: "Ви" },
    ]);

    const response = await GET();

    expect(response.status).toBe(200);
    expect((await response.json()).conversations).toEqual([
      { id: "conv-1", buyerName: "Ви" },
    ]);
    expect(listConversationsForBuyer).toHaveBeenCalledWith("buyer-1");
  });
});
