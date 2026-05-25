import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue(null),
    },
  },
}));

vi.mock("@/server/services/chat.service", () => ({
  claimGuestConversation: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "@/app/api/chat/claim/route";

describe("POST /api/chat/claim", () => {
  it("returns 401 when no session (CHAT-02)", async () => {
    const request = new Request("http://localhost/api/chat/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestToken: "550e8400-e29b-41d4-a716-446655440000" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });
});
